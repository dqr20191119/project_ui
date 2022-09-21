export function featureCompaire (feature, cfeature) {
    let compaireResult;
    if (cfeature == null || feature==null) {
        return compaireResult;
    }
    compaireResult = {};
    for (let k in feature) {
        if (feature[k] != null && cfeature[k] != null) {
            if (feature[k] > cfeature[k]) {
                compaireResult[k]= ">"
            } else if (feature[k] == cfeature[k]) {
                compaireResult[k] = "="
            } else if(feature[k] < cfeature[k]) { 
                compaireResult[k] = "<"
            }
       }
    }
    return compaireResult;
  };