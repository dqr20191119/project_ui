import request from "@/utils/request";
import { getToken } from "@/utils/auth";

// 查询轮播组件列表
export function listInfo(query) {
  return request({
    url: "/config/banner/list",
    method: "get",
    params: query,
  });
}

// 查询轮播组件详细
export function getInfo(id) {
  return request({
    url: "/config/banner/" + id,
    method: "get",
  });
}

// 新增轮播组件
export function addInfo(data) {
  return request({
    url: "/config/banner",
    method: "post",
    data: data,
  });
}

// 修改轮播组件
export function updateInfo(data) {
  return request({
    url: "/config/banner",
    method: "put",
    data: data,
  });
}

// 删除轮播组件
export function delInfo(id) {
  return request({
    url: "/config/banner/" + id,
    method: "delete",
  });
}

// 上传轮播组件
export function upload(data) {
  return request({
    url: "/config/banner/upload",
    method: "post",
    data: data,
    headers: {
      Authorization: "Bearer " + getToken(),
    },
  });
}
