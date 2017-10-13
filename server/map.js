var map = {
    Outside: 0,
    Inside: 1,
};

var manager = {
    currMap: map.Outside,
    changeMap: function () {
        this.currMap = this.currMap === map.Outside ? map.Inside : map.Outside;
        return this.currMap;
    },
};

module.exports = {manager};