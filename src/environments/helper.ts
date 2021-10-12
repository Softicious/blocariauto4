import { LoadingController, AlertController } from '@ionic/angular';

export const helper = {
    environment: "production",
    allowedSentry: false,
    tokenKey: "ps4block-token",
    infoKey: "ps4blockapp_user",
    keyForStorage: "ps4blockmobileapp-",
    keyForPushNotification: "ps4appblocari_push_notification",
    defaultLNG: 'ro',
    defaultKey : 'ps4block_',
    langkey : 'lang',
    emailRegex : "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$",
    codeSMSRegex : /^[0-9]+$/,
    phoneRegex: '[0-9]{6,20}',
    cnpRegex: '[0-9]{13,13}',
    validatorsAccrossApp: {
        minPassword: 8,
        maxPassword: 30,
        emailMaxLength: 50,
        minStringLength: 2,
        maxStringLength: 60,
        minSmsCodeLength: 1,
        maxSmsCodeLength: 1
    },
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'tiff'],
    subcategories:  {
        1: {
            1: {
                id: 1,
                name: 'Preluare loc de parcare in cazul cumpararii imobilului'
            },
            2: {
                id: 2,
                name: 'Actualizare date contract - Modificare date autovehicul (Schimbare autovehicul)'
            },
            3: {
                id: 3,
                name: 'Actualizare date contract - Modificare nume TITULAR (căsătorie/divorț/schimbare nume)'
            },
            4: {
                id: 4,
                name: 'Actualizare date contract - TALON AUTO/RCA'
            },
            5: {
                id: 5,
                name: 'Solicitare schimbare titular la aceeași adresă'
            },
            6: {
                id: 6,
                name: 'Preluare loc de parcare în cazul decesului titularului de contract'
            },
            7: {
                id: 7,
                name: 'Solicitare reziliere contract'
            },
            8: {
                id: 8,
                name: 'Solicitare montare blocator pentru locul de parcare'
            },
            9: {
                id: 9,
                name: 'Sesizare privind marcarea/numerotarea locului de parcare'
            },
            10: {
                id: 10,
                name: 'Alt tip de sesizare privind parcarea de reședință'
            },
            11: {
                id: 11,
                name: 'Probleme legate de plăți'
            },
            12: {
                id: 12,
                name: 'Cerere Reemitere card parcare'
            }
        },
        2: {
            13: {
                id: 13,
                name: 'Actualizare date contract - Modificare date autovehicul (Schimbare autovehicul)'
            },
            14: {
                id: 14,
                name: 'Actualizare date contract - Modificare nume TITULAR (căsătorie/divorț/schimbare nume)'
            },
            15: {
                id: 15,
                name: 'Actualizare date contract - TALON AUTO/RCA'
            },
            16: {
                id: 16,
                name: 'Solicitare reziliere contract'
            },
            17: {
                id: 17,
                name: 'Alt tip de sesizare privind parcarea publica'
            },
            18: {
                id: 18,
                name: 'Probleme legate de plăți'
            },
            19: {
                id: 19,
                name: 'Cerere Reemitere card parcare'
            }
        },
        3: {
            0: {
                id: 0,
                name: 'Solicitare/cerere/petitie'
            }
        },
        4: {
            0: {
                id: 0,
                name: 'Solicitare/cerere/petitie'
            }
        },
        5: {
            0: {
                id: 0,
                name: 'Audiente'
            }
        },
        6: {
            0: {
                id: 0,
                name: 'Solicitare/cerere/petitie'
            }
        }
    }
}