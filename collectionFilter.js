
export default class CollectionFilter {
    constructor(objectList, params, model) {
        this.objectList = objectList
        this.params = params
        this.model = model
    }




    get(){
        //Parametre a ajouter qui ne sont pas inclus dans les parametre du modele
        //sort, field, limit et offset
        let resultList = this.objectList;
        if (this.params != null){
            for (const [key, value] of Object.entries(this.params)) {
                let updatedResultList;
                if (this.containExistingField(key)){
                    updatedResultList = this.getSpecificObjParamQuery(key, value);
            }else if (key.toLocaleLowerCase() == "sort"){
                let splitActionValue = this.defineSortOrder(value);
                if (splitActionValue != -1){
                    updatedResultList = this.applySort(value.split(',')[0], splitActionValue)
                }else{
                    updatedResultList = resultList;
                }
                
            } else if (key.toLocaleLowerCase() == "limit"){

            if ("offset" in this.params){

                
            }
            }else if (key.toLocaleLowerCase() == "field"){

            }else {
                updatedResultList = resultList;
            }

            resultList = updatedResultList;
            
        }   
        return resultList;
    } else {
        return this.objectList;
    }

    }


    containExistingField(targetField){
        let doesContainField = false;
        for (let i = 0; i < this.model.fields.length && !doesContainField; i++){
            if (targetField == this.model.fields[i]["name"]){
                doesContainField = true;
            }
        }
        return doesContainField;
    }

    defineSortOrder(value){
        let splitSortValue = value.split(",");
        if (this.containExistingField(splitSortValue[0])) {
            if (splitSortValue.length == 1){
                return 0
            } else if (splitSortValue[1] == "desc"){
                return 1
            }else {
                return -1
            }
        }
        else {
            return -1
        }
    }

    getSpecificObjParamQuery(key, value){
    }

    applySort(field, isDesc){
        let sortedList = this.objectList;
        for (let i = 0; i < this.objectList.length; i++){
            for (let j = i; j < this.objectList.length; j++){
                if (this.innerCompare(sortedList[i][field],sortedList[j][field]) > 0){
                    let temp = sortedList[i];
                    sortedList[i]= sortedList[j];
                    sortedList[j] = temp;
                }
            }
        }
        if (isDesc){
            return sortedList.reverse()
        }else{
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

