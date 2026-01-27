/**
 * Validációs függvények tesztjei
 *
 * Ez a fájl a src/lib/utils.ts validációs függvényeit teszteli.
 */

import { describe, it, expect } from 'vitest';
import {
    validateEmail,
    validatePhone,
    validateZip,
    validateCity,
    validateStreet
} from '../src/lib/utils';

// ============================================================================
// EMAIL VALIDÁCIÓ TESZTEK
// ============================================================================

describe('validateEmail', () => {
    describe('helyes email címek', () => {
        it('egyszerű email címet elfogad', () => {
            expect(validateEmail('pelda@email.hu')).toBe(true);
        });

        it('számokat tartalmazó email címet elfogad', () => {
            expect(validateEmail('pelda123@email.hu')).toBe(true);
        });

        it('pontot tartalmazó felhasználónévvel elfogad', () => {
            expect(validateEmail('pelda.nev@email.hu')).toBe(true);
        });

        it('aldomaint tartalmazó email címet elfogad', () => {
            expect(validateEmail('pelda@mail.email.hu')).toBe(true);
        });

        it('plusz jelet tartalmazó email címet elfogad', () => {
            expect(validateEmail('pelda+spam@email.hu')).toBe(true);
        });

        it('szóközöket levág és elfogad', () => {
            expect(validateEmail('  pelda@email.hu  ')).toBe(true);
        });
    });

    describe('helytelen email címek', () => {
        it('@ nélküli címet elutasít', () => {
            expect(validateEmail('peldaemail.hu')).toBe(false);
        });

        it('domain nélküli címet elutasít', () => {
            expect(validateEmail('pelda@')).toBe(false);
        });

        it('felhasználónév nélküli címet elutasít', () => {
            expect(validateEmail('@email.hu')).toBe(false);
        });

        it('TLD nélküli címet elutasít', () => {
            expect(validateEmail('pelda@email')).toBe(false);
        });

        it('szóközt tartalmazó címet elutasít', () => {
            expect(validateEmail('pelda nev@email.hu')).toBe(false);
        });

        it('üres stringet elutasít', () => {
            expect(validateEmail('')).toBe(false);
        });

        it('csak szóközöket elutasít', () => {
            expect(validateEmail('   ')).toBe(false);
        });
    });
});

// ============================================================================
// TELEFONSZÁM VALIDÁCIÓ TESZTEK
// ============================================================================

describe('validatePhone', () => {
    describe('helyes telefonszámok (+36 formátum)', () => {
        it('+36 20 xxx xxxx formátumot elfogad', () => {
            expect(validatePhone('+36 20 123 4567')).toBe(true);
        });

        it('+36 30 xxx xxxx formátumot elfogad', () => {
            expect(validatePhone('+36 30 123 4567')).toBe(true);
        });

        it('+36 70 xxx xxxx formátumot elfogad', () => {
            expect(validatePhone('+36 70 123 4567')).toBe(true);
        });

        it('+3620xxxxxxx formátumot (szóköz nélkül) elfogad', () => {
            expect(validatePhone('+36201234567')).toBe(true);
        });

        it('kötőjeles formátumot elfogad', () => {
            expect(validatePhone('+36-20-123-4567')).toBe(true);
        });
    });

    describe('helyes telefonszámok (06 formátum)', () => {
        it('06 20 xxx xxxx formátumot elfogad', () => {
            expect(validatePhone('06 20 123 4567')).toBe(true);
        });

        it('06 30 xxx xxxx formátumot elfogad', () => {
            expect(validatePhone('06 30 123 4567')).toBe(true);
        });

        it('06 70 xxx xxxx formátumot elfogad', () => {
            expect(validatePhone('06 70 123 4567')).toBe(true);
        });

        it('0620xxxxxxx formátumot (szóköz nélkül) elfogad', () => {
            expect(validatePhone('06201234567')).toBe(true);
        });
    });

    describe('helytelen telefonszámok', () => {
        it('rövidebb számot elutasít', () => {
            expect(validatePhone('+36 20 123 456')).toBe(false);
        });

        it('hosszabb számot elutasít', () => {
            expect(validatePhone('+36 20 123 45678')).toBe(false);
        });

        it('rossz operátorkódot elutasít (50)', () => {
            expect(validatePhone('+36 50 123 4567')).toBe(false);
        });

        it('rossz előhívót elutasít (07)', () => {
            expect(validatePhone('07 20 123 4567')).toBe(false);
        });

        it('betűket tartalmazó számot elutasít', () => {
            expect(validatePhone('+36 20 abc 4567')).toBe(false);
        });

        it('üres stringet elutasít', () => {
            expect(validatePhone('')).toBe(false);
        });

        it('vezetékes számot elutasít (1 - Budapest)', () => {
            expect(validatePhone('+36 1 123 4567')).toBe(false);
        });
    });
});

// ============================================================================
// IRÁNYÍTÓSZÁM VALIDÁCIÓ TESZTEK
// ============================================================================

describe('validateZip', () => {
    describe('helyes irányítószámok', () => {
        it('budapesti irányítószámot elfogad (1xxx)', () => {
            expect(validateZip('1051')).toBe(true);
        });

        it('vidéki irányítószámot elfogad', () => {
            expect(validateZip('6720')).toBe(true);
        });

        it('másik vidéki irányítószámot elfogad', () => {
            expect(validateZip('9400')).toBe(true);
        });

        it('szóközöket levág és elfogad', () => {
            expect(validateZip('  1051  ')).toBe(true);
        });
    });

    describe('helytelen irányítószámok', () => {
        it('3 számjegyet elutasít', () => {
            expect(validateZip('123')).toBe(false);
        });

        it('5 számjegyet elutasít', () => {
            expect(validateZip('12345')).toBe(false);
        });

        it('betűket tartalmazó kódot elutasít', () => {
            expect(validateZip('123a')).toBe(false);
        });

        it('üres stringet elutasít', () => {
            expect(validateZip('')).toBe(false);
        });

        it('szóközöket tartalmazó kódot elutasít', () => {
            expect(validateZip('10 51')).toBe(false);
        });
    });
});

// ============================================================================
// TELEPÜLÉS NÉV VALIDÁCIÓ TESZTEK
// ============================================================================

describe('validateCity', () => {
    describe('helyes település nevek', () => {
        it('egyszerű nevet elfogad', () => {
            expect(validateCity('Budapest')).toBe(true);
        });

        it('ékezetes nevet elfogad', () => {
            expect(validateCity('Szeged')).toBe(true);
        });

        it('több szóból álló nevet elfogad', () => {
            expect(validateCity('Hajdúböszörmény')).toBe(true);
        });

        it('kötőjeles nevet elfogad', () => {
            expect(validateCity('Dunaújváros-Palotaváros')).toBe(true);
        });

        it('szóközös nevet elfogad', () => {
            expect(validateCity('Baja város')).toBe(true);
        });

        it('minden magyar ékezetes karaktert elfogad', () => {
            expect(validateCity('ÁÉÍÓÖŐÚÜŰáéíóöőúüű')).toBe(true);
        });

        it('szóközöket levág és elfogad', () => {
            expect(validateCity('  Budapest  ')).toBe(true);
        });
    });

    describe('helytelen település nevek', () => {
        it('számokat tartalmazó nevet elutasít', () => {
            expect(validateCity('Budapest2')).toBe(false);
        });

        it('egy karakteres nevet elutasít', () => {
            expect(validateCity('A')).toBe(false);
        });

        it('üres stringet elutasít', () => {
            expect(validateCity('')).toBe(false);
        });

        it('speciális karaktereket elutasít', () => {
            expect(validateCity('Budapest!')).toBe(false);
        });
    });
});

// ============================================================================
// CÍM (UTCA, HÁZSZÁM) VALIDÁCIÓ TESZTEK
// ============================================================================

describe('validateStreet', () => {
    describe('helyes cím formátumok', () => {
        it('egyszerű utcanevet házszámmal elfogad', () => {
            expect(validateStreet('Kossuth utca 10')).toBe(true);
        });

        it('rövidített formátumot elfogad', () => {
            expect(validateStreet('Petőfi u. 5')).toBe(true);
        });

        it('emelet/ajtó megjelöléssel elfogad', () => {
            expect(validateStreet('Deák tér 3, 2. em. 5.')).toBe(true);
        });

        it('ékezetes karaktereket elfogad', () => {
            expect(validateStreet('Körút 12')).toBe(true);
        });

        it('kötőjeles házszámot elfogad', () => {
            expect(validateStreet('Fő utca 10-12')).toBe(true);
        });

        it('szóközöket levág és elfogad', () => {
            expect(validateStreet('  Kossuth utca 10  ')).toBe(true);
        });
    });

    describe('helytelen cím formátumok', () => {
        it('két karakteres címet elutasít', () => {
            expect(validateStreet('AB')).toBe(false);
        });

        it('üres stringet elutasít', () => {
            expect(validateStreet('')).toBe(false);
        });

        it('speciális karaktereket elutasít (@)', () => {
            expect(validateStreet('Email@utca 1')).toBe(false);
        });

        it('speciális karaktereket elutasít (!)', () => {
            expect(validateStreet('Fő utca 1!')).toBe(false);
        });
    });
});
