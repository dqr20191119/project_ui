import request from "@/utils/request";

// 查询表格配置列表
export function listByCptId(query) {
  return request({
    url: "/config/table/listByCptId",
    method: "get",
    params: query,
  });
}

// 查询表格配置详细
export function getInfo(id) {
  return request({
    url: "/config/table/" + id,
    method: "get",
  });
}

// 新增表格配置
export function addInfo(data) {
  return request({
    url: "/config/table",
    method: "post",
    data: data,
  });
}

// 修改表格配置
export function updateInfo(data) {
  return request({
    url: "/config/table",
    method: "put",
    data: data,
  });
}

// 删除表格配置
export function delInfo(id) {
  return request({
    url: "/config/table/" + id,
    method: "delete",
  });
}

// 查询图例树
export function initTableTreeSelect(id) {
  return request({
    url: "/config/table/treeSelect/" + id,
    method: "get",
  });
}
