// 查询角色列表
import request from "@/utils/request";

export function listDecisionManage(query) {
  return request({
    url: "/project/manager/list",
    method: "get",
    params: query,
  });
}

export function initTreeList(query) {
  return request({
    url: "/project/manager/initTreeList",
    method: "get",
    params: query,
  });
}

export function bizTreeSelect(query) {
  if (query == undefined) {
    query = {};
  }
  return request({
    url: "/project/manager/treeSelect",
    method: "get",
    params: query,
  });
}

// 查询详细
export function getInfo(id) {
  return request({
    url: "/project/manager/" + id,
    method: "get",
  });
}

// 新增
export function addInfo(data) {
  return request({
    url: "/project/manager",
    method: "post",
    data: data,
  });
}

// 修改
export function updateInfo(data) {
  return request({
    url: "/project/manager",
    method: "put",
    data: data,
  });
}

// 删除
export function delInfo(id) {
  return request({
    url: "/project/manager/" + id,
    method: "delete",
  });
}
