import { findComponentInfo } from "@/api/config/component";

/** 根据菜单ID获取树节点配置信息 */
export function initTree(_menuId, _bizType) {
  let treeConfig = {};
  if (_menuId == null) {
    return treeConfig;
  }
  findComponentInfo(_menuId, _bizType).then((response) => {
    if (!response.data) {
      return;
    }
    let legendConfigData = response.data.decLegendConfigList;
    if (legendConfigData && legendConfigData.length > 0) {
      //设置树节点数据
      let treeData_ = legendConfigData[0];
      treeConfig.treeData = treeData_;
      //设置顶级菜单选中
      let checkedIds_ = [];
      let expandIds = [];
      for (let k = 0; k < treeData_.length; k++) {
        let item = treeData_[k];
        if (item.parentId == null) {
          checkedIds_.push(item.id);
          let children_ = item.children;
          if (children_ != null && children_.length != 0) {
            for (let j = 0; j < children_.length; j++) {
              expandIds.push(children_[j].id);
            }
          } else {
            expandIds.push(item.id);
          }
        }
      }
      //默认展展开二级菜单
      treeConfig.defaultExpandIds = expandIds;
      treeConfig.defaultCheckedIds = checkedIds_;
    }
  });
  console.log(treeConfig);

  return treeConfig;
}
