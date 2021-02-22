
/**
 * The class for Super Smash Bros. Ultimate fighters
 */
class Fighter {
    /**
     * Create a Fighter
     * @param {object} data The Fighter's data
     * @param {number} data[0] The Fighter's number
     * @param {string} data[1] The Fighter's name
     * @param {boolean} data[2] The Fighter's echo status
     * @param {boolean} data[3] The Fighter's alternate status
     * @param {string} data[4] The Fighter's image source
     */
    constructor(data) {
        this.id = data[0];
        this.name = data[1];
        this.isEcho = data[2];
        this.isAlternate = data[3];
        this.imgSrc = data[4];
        this.audSrc = data[5];
    }
}

export default Fighter;
