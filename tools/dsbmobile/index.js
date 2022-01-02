export default class DSBMobile {
    BASE_URL = 'https://mobileapi.dsbcontrol.de';
    BUNDLE_ID = 'de.heinekingmedia.dsbmobile';
    APP_VERSION = '36';
    OS_VERSION = '30';

    username;
    password;

    token;

    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    async login(){
        const url = `${DSBMobile.BASE_URL}/authid?bundleid=${DSBMobile.BUNDLE_ID}&appversion=${DSBMobile.APP_VERSION}&osversion=${DSBMobile.OS_VERSION}&pushid&user=${this.username}&password=${this.password}`;

        // the native implementations of @capacitor-community/http are kinda broken, so we can only accept the content-type 'text/json' instead of 'application/json'
        const token = await Http.request({
            method: 'GET',
            url,
            responseType: 'text',
            headers: {
                'Accept': 'text/*'
            }
        }).then(response => JSON.parse(response.data));

        if (!token) {
            throw new Error('Error while authenticating with dsbmobile');
        }

        this.token = token;
    }

    async getTimetable() {
        const meta = await this.fetchMetaData();

        if (!meta) {
            throw new Error('Could not fetch timetable meta data.');
        }

        const {Detail: url, Date: time} = meta[0]['Childs'][0];

        return {
            url,
            time,
            items: await this.parseTimetable(url)
        };
    }

    async fetchMetaData() {
        const json = await Http.request({
            method: 'GET',
            url: `${DSBMobile.BASE_URL}/dsbtimetables?authid=${this.token}`
        }).then(response => response.data);

        if (json['Message']) {
            throw new Error('dsbError: ' + json['Message']);
        }

        return json;
    }

    async parseTimetable(url) {
        try {
            const response = await Http.request({
                method: 'GET',
                url
            });

            const {data} = response;

            const parser = new DOMParser();
            const document = parser.parseFromString(data, 'text/html');

            const documents = this.splitDocuments(document);

            const dates = [];
            const days = new Map();
            const information = new Map();
            let absentClasses = [];

            documents.forEach(document => {
                const date = document.querySelector('a')?.getAttribute('name');
                if (date) {
                    dates.push(date);
                }

                document.querySelectorAll('table').forEach(table => {
                    switch (table.getAttribute('class')) {
                        case 'F':
                            if (table.innerText.trim()) {
                                information.set(date, Array.from(table.querySelectorAll('th')).map(th => th.innerText.trim()).join('\n'));
                            }
                            break;
                        case 'K':
                            absentClasses = absentClasses.concat(Array.from(table.querySelectorAll('tbody')).map(tbody => {
                                return {
                                    date: date,
                                    class: tbody.querySelector('th')?.innerText.trim(),
                                    period: Array.from(tbody.querySelectorAll('td')).map(td => td.innerText.trim()).join(', ')
                                };
                            }));
                            break;
                        case 'k':
                            days.set(date, Array.from(table.querySelectorAll('tbody')).filter(tbody => !tbody.innerText.trim().startsWith('Klasse')).map(tbody => {
                                const className = tbody.querySelector('th')?.innerText.trim();

                                const items = Array.from(tbody.querySelectorAll('tr')).map(tr => {
                                    const td = tr.querySelectorAll('td');

                                    return {
                                        teacher: td.item(0).innerText.trim(),
                                        period: td.item(1).innerText.trim(),
                                        subTeacher: td.item(2).innerText.trim(),
                                        room: td.item(3).innerText.trim(),
                                        info: td.item(4).innerText.trim(),
                                        fullClass: className
                                    };
                                });

                                return {
                                    name: className,
                                    items
                                };
                            }));
                            break;
                        case 'G':
                            absentClasses = absentClasses.concat(Array.from(table.querySelectorAll('tbody')).map(tbody => {
                                return {
                                    date: date,
                                    class: 'Gesamte Schule',
                                    period: tbody.querySelector('th')?.innerText.trim(),
                                    info: Array.from(tbody.querySelectorAll('td')).map(td => td.innerText.trim()).join(', ')
                                };
                            }));
                            break;
                    }
                });
            });

            return {
                dates,
                days,
                information,
                absentClasses
            };

        } catch (e) {
            return Promise.reject(e);
        }
    }

    // adopted from https://github.com/EffnerApp/effnerapp-android-legacy/blob/master/app/src/main/java/de/effnerapp/effner/data/dsbmobile/DSBClient.java#L164
    splitDocuments(document) {
        const parser = new DOMParser();

        const elements = [];

        document.querySelectorAll('a').forEach(a => {
            if (a.getAttribute('name')) {
                elements.push(a.outerHTML);
            }
        });

        const documents = [];
        const outer = document.documentElement.outerHTML;
        for (let i = 0; i < elements.length; i++) {
            if (i === elements.length - 1) {
                documents.push(parser.parseFromString(outer.substr(outer.indexOf(elements[i])), 'text/html'));
            } else if (i !== 0) {
                const indexStart = outer.indexOf(elements[i]);
                const length = outer.indexOf(elements[i + 1]) - indexStart;
                documents.push(parser.parseFromString(outer.substr(indexStart, length), 'text/html'));
            }
        }

        return documents;
    }
}
