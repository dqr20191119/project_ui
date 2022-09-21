export function formatFixNum(params, length) {
  let newpar = parseFloat(params);
  let reg = /^[0-9]+.?[0-9]*$/;
  if (reg.test(newpar)) {
    let newNum = newpar.toFixed(length);
    return newNum;
  } else {
    return params;
  }
}

export function convertFeature(feature) {
  let f = {};
  f.properties = {};
  if (feature == null || feature.values_ == null) {
    return f;
  }
  for (let k in feature.values_) {
    f.properties[k] = feature.values_[k];
  }
  return f;
}
