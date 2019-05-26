/* Contiene todas las clases */

module.exports = {
    Callback: class Callback {
        constructor(positive, negative, after, current) {
            this.ipositive = positive;
            this.inegative = negative;
            this.iafter = after;
            this.icurrent = current;
        }

        get positive() {
            return this.ipositive;
        }

        get negative() {
            return this.inegative;
        }

        get after() {
            return this.iafter;
        }

        get current() {
            return this.icurrent;
        }
    }
}
