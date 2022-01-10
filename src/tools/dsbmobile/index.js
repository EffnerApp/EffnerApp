import axios from "axios";
import {parse} from "node-html-parser";

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

    async login() {
        const url = `${this.BASE_URL}/authid?bundleid=${this.BUNDLE_ID}&appversion=${this.APP_VERSION}&osversion=${this.OS_VERSION}&pushid&user=${this.username}&password=${this.password}`;

        try {
            const {data} = await axios.get(url);
            this.token = data;
        } catch (e) {
            throw new Error('Error while authenticating with dsbmobile');
        }
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
            data: await this.parseTimetable(url)
        };
    }

    async fetchMetaData() {
        try {
            const {data} = await axios.get(`${this.BASE_URL}/dsbtimetables?authid=${this.token}`);

            if (data['Message']) {
                throw new Error('dsbError: ' + data['Message']);
            }

            return data;
        } catch (e) {
            throw e;
        }
    }

    async parseTimetable(url) {
        try {
            const {data} = await axios.get(url);

            const document = parse(data, {});

            console.log(!!document)

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
                                        teacher: td[0].innerText.trim(),
                                        period: td[1].innerText.trim(),
                                        subTeacher: td[2].innerText.trim(),
                                        room: td[3].innerText.trim(),
                                        info: td[4].innerText.trim(),
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
        const elements = [];

        document.querySelectorAll('a').forEach(a => {
            if (a.attributes['name']) {
                elements.push(a.outerHTML);
            }
        });

        const documents = [];
        const outer = document.outerHTML;
        console.log(!!outer)
        for (let i = 0; i < elements.length; i++) {
            if (i === elements.length - 1) {
                documents.push(parse(outer.substr(outer.indexOf(elements[i])), {}));
            } else if (i !== 0) {
                const indexStart = outer.indexOf(elements[i]);
                const length = outer.indexOf(elements[i + 1]) - indexStart;
                documents.push(parse(outer.substr(indexStart, length), {}));
            }
        }

        return documents;
    }
}
