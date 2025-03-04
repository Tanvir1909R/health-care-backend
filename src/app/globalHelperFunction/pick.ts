const pick = <o extends object,k extends keyof o>(obj:o,keys:k[])=>{
    const finalObj: Partial<o> = {};
    for(let key of keys){
        if(obj && Object.hasOwnProperty.call(obj,key)){
            finalObj[key] = obj[key]
        }
    }
    
    return finalObj
}

export default pick