import request from "@/utils/request";
import { getToken } from "@/utils/auth";

// 查询文件信息列表
export function listInfo(query) {
  return request({
    url: "/config/file/list",
    method: "get",
    params: query,
  });
}

// 查询文件信息详细
export function getInfo(id) {
  return request({
    url: "/config/file/" + id,
    method: "get",
  });
}

// 新增文件信息
export function addInfo(data) {
  return request({
    url: "/config/file",
    method: "post",
    data: data,
  });
}

// 修改文件信息
export function updateInfo(data) {
  return request({
    url: "/config/file",
    method: "put",
    data: data,
  });
}

// 删除文件信息
export function delInfo(id) {
  return request({
    url: "/config/file/" + id,
    method: "delete",
  });
}

// 上传文件
export function upload(data) {
  return request({
    url: "/config/file/upload",
    method: "post",
    data: data,
    headers: {
      Authorization: "Bearer " + getToken(),
    },
  });
}
