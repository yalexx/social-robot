import {Utils} from "../utils/unitls";

export module userGenerator {

    import generateRandString = Utils.generateRandString;
    let userData;

    export function generateSIDData(data, provider, gender?): any {
        let country;
        let genderEnding;
        if (provider === 'gmx.net' || provider === 'web.de') {
            country = 'de';
        }
        else if (provider === 'abv.bg' || provider === 'dir.bg') {
            country = 'bg';
            genderEnding = 'a';
        }

        userData = {
            type: 'email',
            provider: provider,
            isUsed: false,
            isVerified: false,
            country: country,
            gender: gender || generateGender(),
            name: '',
            familyName: '',
            zip: getRandomInt(10000, 50000),
            city: generateCity(data),
            street: generateStreet(data),
            streetNumber: getRandomInt(1, 100),
            day: getRandomInt(1, 28),
            month: getRandomInt(1, 12),
            year: getRandomInt(1970, 1990),
            registerEmail: '',
            registerPassword: generatePassword(10),
            secretQuestion: generateRandString(5),
        };

        let rand = getRandomInt(0, (data.surname.length - 1));
        let fName = data.surname[rand];

        if (userData.gender == 'male') {
            userData.name = generateMaleName(data);
            userData.familyName = fName
        }
        else {
            userData.name = generateFemaleName(data);
            userData.familyName = fName + 'a';
        }
        userData.registerEmail = generateEmail(userData);

        return userData;
    }

    function generateGender(): string {
        let genders = ['male', 'female'];
        let rand = getRandomInt(0, 1);
        return genders[rand];
    }

    function generateMaleName(data): string {
        let rand = getRandomInt(0, (data.male.length - 1));
        return data.male[rand];
    }

    function generateFemaleName(data): string {
        let rand = getRandomInt(0, (data.female.length - 1));
        return data.female[rand];
    }

    export function getRandomInt(min, max): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    export function generateCity(data): string {
        let rand = getRandomInt(0, data.city.length);
        return data.city[rand];
    }

    export function generateStreet(data): string {
        let rand = getRandomInt(0, data.street.length);
        return data.street[rand];
    }

    export function generatePassword(length): string {
        let pass = '';
        let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++)
            pass += possible.charAt(Math.floor(Math.random() * possible.length));
        return pass;
    }

    export function generateNumberString(length) {
        let text = "";
        let possible = "0123456089";

        for (let i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }


    export function generateEmail(userData): string {
        let email = userData.name + userData.familyName + generateRandString(4);
        return email.toLowerCase();
    }


}