import request from "@/utils/request";

// 查询文本自定义信息列表
export function listInfo(query) {
  return request({
    url: "/config/text/list",
    method: "get",
    params: query,
  });
}

// 查询文本自定义信息详细
export function getInfo(id) {
  return request({
    url: "/config/text/" + id,
    method: "get",
  });
}

// 根据组件ID查询文本信息
export function save(data) {
  return request({
    url: "/config/text/save",
    method: "post",
    data: data,
  });
}

// 根据组件ID查询文本信息
export function queryByCmpId(componentId) {
  return request({
    url: "/config/text/queryByCmpId/" + componentId,
    method: "get",
  });
}

// 新增文本自定义信息
export function addInfo(data) {
  return request({
    url: "/config/text",
    method: "post",
    data: data,
  });
}

// 修改文本自定义信息
export function updateInfo(data) {
  return request({
    url: "/config/text",
    method: "put",
    data: data,
  });
}

// 删除文本自定义信息
export function delInfo(id) {
  return request({
    url: "/config/text/" + id,
    method: "delete",
  });
}
