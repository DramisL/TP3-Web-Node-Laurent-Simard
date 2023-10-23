
export default class CollectionFilter {
    constructor(objectList, params, model) {
        this.objectList = objectList
        this.params = params
        this.model = model
    }




    get() {
        //Parametre a ajouter qui ne sont pas inclus dans les parametre du modele
        //sort, field, limit et offset
        let resultList = this.objectList;
        if (this.params != null) {
            for (const [key, value] of Object.entries(this.params)) {
                let updatedResultList = [];
                if (this.containExistingField(key)) {
                    updatedResultList = this.getSpecificObjParamQuery(key, value, resultList);
                } else if (key.toLocaleLowerCase() == "sort") {
                    let splitActionValue = this.defineSortOrder(value);
                    if (splitActionValue != -1) {
                        updatedResultList = this.applySort(value.split(',')[0], splitActionValue, resultList)
                    } else {
                        updatedResultList = resultList;
                    }

                } else if (key.toLocaleLowerCase() == "field") {
                    let fieldToInclude = this.params[key.toLocaleLowerCase()].split(",")
                    resultList.forEach(element => {
                        let newEntry = {};
                        for (let i = 0; i < fieldToInclude.length; i++) {
                            newEntry[fieldToInclude[i]] = element[fieldToInclude[i]];
                        }

                        let containsDuplicate = false;
                        updatedResultList.forEach(entry => {
                            if (this.equals(entry, newEntry)) {
                                containsDuplicate = true
                            }
                        });

                        if (!containsDuplicate) {
                            updatedResultList.push(newEntry)
                        }
                    });
                } else if (key.toLocaleLowerCase() == "limit") {
                    if ("offset" in this.params) {
                        for (let n = this.params[key] * this.params["offset"]; n < (parseInt(this.params[key]) * parseInt(this.params["offset"])) + parseInt(this.params[key]); n++) {
                            updatedResultList.push(resultList[n]);
                        }
                    } else {
                        for (let n = 0; n < parseInt(this.params[key]); n++) {
                            updatedResultList.push(resultList[n]);
                        }
                    }
                } else {
                    updatedResultList = resultList;
                }
                resultList = updatedResultList;
            }
            return resultList;
        } else {
            return this.objectList;
        }

    }

    //Code tirer de : https://medium.com/geekculture/object-equality-in-javascript-2571f609386e
    equals(ox, oy) {
        let propsX = Object.getOwnPropertyNames(ox);
        let propsY = Object.getOwnPropertyNames(oy);
        if (propsX.length != propsY.length) {
            return false;
        }
        for (var i = 0; i < propsX.length; i++) {
            let valX = ox[propsX[i]];
            let valY = oy[propsY[i]];
            let isObjects = this.isObject(valX) && this.isObject(valY);
            if (isObjects && !this.equal(valX, valY) || !isObjects && valX !== valY) {
                return false;
            }
        }
        return true;
    }
    isObject(object) {
        return object != null && typeof object === 'object';
    }
    containExistingField(targetField) {
        let doesContainField = false;
        for (let i = 0; i < this.model.fields.length && !doesContainField; i++) {
            if (targetField == this.model.fields[i]["name"]) {
                doesContainField = true;
            }
        }
        return doesContainField;
    }

    defineSortOrder(value) {
        let splitSortValue = value.split(",");
        if (this.containExistingField(splitSortValue[0])) {
            if (splitSortValue.length == 1) {
                return 0
            } else if (splitSortValue[1] == "desc") {
                return 1
            } else {
                return -1
            }
        }
        else {
            return -1
        }
    }

    getSpecificObjParamQuery(key, value, resultList) {

        let newList = [];
        resultList.forEach(element => {
            if (element[key] !== undefined) {
                let splitString = value.split("*");
                if (splitString.length == 1 && splitString[0] === value) {
                    newList.push(element);
                } else if (splitString.length == 3 && element[key].includes(splitString[1])) {
                    newList.push(element)
                } else if (splitString.length == 2) {
                    let isRespectingSearchConditions = true;
                    if (splitString[0] != "" && !(element[key].startsWith(splitString[0]))) {
                        isRespectingSearchConditions = false;
                    }
                    if (splitString[1] != "" && !(element[key].endsWith(splitString[1]))) {
                        isRespectingSearchConditions = false;
                    }
                    if (isRespectingSearchConditions) {
                        newList.push(element);
                    }
                }
            } else {
                return resultList;
            }
        })
        return newList;
    }

    applySort(field, isDesc, resultList) {
        let sortedList = resultList;
        for (let i = 0; i < resultList.length; i++) {
            for (let j = i; j < resultList.length; j++) {
                if (this.innerCompare(sortedList[i][field], sortedList[j][field]) > 0) {
                    let temp = sortedList[i];
                    sortedList[i] = sortedList[j];
                    sortedList[j] = temp;
                }
            }
        }
        if (isDesc) {
            return sortedList.reverse()
        } else {
            return sortedList;
        }
    }

    valueMatch(value, searchValue) {
        try {
            let exp = '^' + searchValue.toLowerCase().replace(/\*/g, '.*') + '$';
            return new RegExp(exp).test(value.toString().toLowerCase());
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    compareNum(x, y) {
        if (x === y) return 0;
        else if (x < y) return -1;
        return 1;
    }
    innerCompare(x, y) {
        if ((typeof x) === 'string')
            return x.localeCompare(y);
        else
            return this.compareNum(x, y);
    }
}

