import request from "@/utils/request";

// 查询【请填写功能名称】列表
export function listConfig(query) {
  return request({
    url: "/config/legend/list",
    method: "get",
    params: query,
  });
}

// 查询【请填写功能名称】详细
export function getConfig(id) {
  return request({
    url: "/config/legend/" + id,
    method: "get",
  });
}

// 新增【请填写功能名称】
export function addConfig(data) {
  return request({
    url: "/config/legend/add",
    method: "post",
    data: data,
  });
}

// 修改【请填写功能名称】
export function updateConfig(data) {
  return request({
    url: "/config/legend/edit",
    method: "put",
    data: data,
  });
}

// 删除【请填写功能名称】
export function delConfig(id) {
  return request({
    url: "/config/legend/delete/" + id,
    method: "delete",
  });
}

// 查询图例树
export function initLegendTreeSelect(id) {
  return request({
    url: "/config/legend/treeSelect/" + id,
    method: "get",
  });
}

//根据组件ID查询图例信息
export function listByCptId(queryParams) {
  return request({
    url: "/config/legend/listByCptId",
    params: queryParams,
    method: "get",
  });
}

//根据图层信息查询高亮模式
export function getHighLightMode(queryParams) {
  return request({
    url: "/config/legend/getHighLightMode",
    params: queryParams,
    method: "get",
  });
}
