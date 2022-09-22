import request from '@/utils/request'

// 查询项目管理列表
export function listManager(query) {
  return request({
    url: '/project/manager2/list',
    method: 'get',
    params: query
  })
}

// 查询项目管理详细
export function getManager(id) {
  return request({
    url: '/project/manager2/' + id,
    method: 'get'
  })
}

// 新增项目管理
export function addManager(data) {
  return request({
    url: '/project/manager2',
    method: 'post',
    data: data
  })
}


export function cityList() {
  return request({
    url: '/system/city/cityList',
    method: 'get'
  })
}
// 保存项目管理
export function saveManager(data) {
  return request({
    url: '/project/manager2/saveManager',
    method: 'post',
    data: data
  })
}

// 修改项目管理
export function updateManager(data) {
  return request({
    url: '/project/manager2',
    method: 'put',
    data: data
  })
}

// 删除项目管理
export function delManager(id) {
  return request({
    url: '/project/manager2/' + id,
    method: 'delete'
  })
}
