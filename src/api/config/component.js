import request from "@/utils/request";

// 查询组件信息列表
export function listInfo(query) {
  return request({
    url: "/config/component/list",
    method: "get",
    params: query,
  });
}

// 查询组件详细
export function getInfo(id) {
  return request({
    url: "/config/component/" + id,
    method: "get",
  });
}

// 新增组件信息
export function addInfo(data) {
  return request({
    url: "/config/component/add",
    method: "post",
    data: data,
  });
}

// 修改组件信息
export function updateInfo(data) {
  return request({
    url: "/config/component/edit",
    method: "put",
    data: data,
  });
}

// 删除组件信息
export function delInfo(id) {
  return request({
    url: "/config/component/delete/" + id,
    method: "delete",
  });
}

// 根据菜单查询组件信息
export function findComponentInfo(menuId, bizType, bizId) {
  let param = {};
  param.menuId = menuId;
  if (bizType != undefined && bizType != null) {
    param.bizType = bizType;
  }
  if (bizId != undefined && bizId != null) {
    param.bizId = bizId;
  }
  console.log(param);
  return request({
    url: "/config/component/findCptInfo",
    method: "get",
    params: param,
  });
}
// 轮播图
export function getBanner(id) {
  return request({
    url: "/config/banner/" + id,
    method: "get",
  });
}