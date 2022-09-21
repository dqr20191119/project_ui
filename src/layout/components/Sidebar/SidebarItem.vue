<template>
  <div v-if="!item.hidden" style="display: inline-block">
    <template
      v-if="
        hasOneShowingChild(item.children, item) &&
        (!onlyOneChild.children || onlyOneChild.noShowingChildren) &&
        !item.alwaysShow
      "
    >
      <app-link
        v-if="onlyOneChild.meta"
        :to="
          resolvePath(
            onlyOneChild.path + '?menuId=' + onlyOneChild.meta.menuId,
            onlyOneChild.query
          )
        "
      >
        <el-menu-item
          :index="resolvePath(onlyOneChild.path)"
          :class="{ 'submenu-title-noDropdown': !isNest }"
          @mouseenter.native="mouseenterActive"
          @mouseleave.native="mouseleaveActive"
        >
          <img
            class="nav_icon"
            :src="bingActiveIcon(onlyOneChild)"
            v-if="active || $route.path == '/' + onlyOneChild.path"
          />
          <img
            class="nav_icon"
            :src="bingIcon(onlyOneChild)"
            alt=""
            srcset=""
            v-else
          />
          <span class="asider_span_text">{{ onlyOneChild.meta.title }}</span>
        </el-menu-item>
      </app-link>
    </template>

    <el-submenu
      v-else
      ref="subMenu"
      :index="resolvePath(item.path)"
      @mouseenter.native="mouseenterActive"
      @mouseleave.native="mouseleaveActive"
      :class="{ 'is-active': $route.path.includes(item.path) }"
    >
      <template slot="title">
        <img
          class="nav_icon"
          :src="bingActiveIcon(item)"
          v-if="active || $route.path.includes(item.path)"
        />
        <img class="nav_icon" :src="bingIcon(item)" alt="" srcset="" v-else />
        <span class="asider_span_text">{{ item.meta.title }}</span>
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
        class="nest-menu111"
        style="display: block"
      />
    </el-submenu>
  </div>
</template>

<script>
import path from 'path'
import { isExternal } from '@/utils/validate'
import Item from './Item'
import AppLink from './Link'
import FixiOSBug from './FixiOSBug'

export default {
  name: 'SidebarItem',
  components: { Item, AppLink },
  mixins: [FixiOSBug],
  props: {
    // route object
    item: {
      type: Object,
      required: true
    },
    isNest: {
      type: Boolean,
      default: false
    },
    basePath: {
      type: String,
      default: ''
    }
  },
  data () {
    this.onlyOneChild = null
    return {
      active: false
    }
  },
  methods: {
    hasOneShowingChild (children = [], parent) {
      if (!children) {
        children = [];
      }
      const showingChildren = children.filter(item => {
        if (item.hidden) {
          return false
        } else {
          // Temp set(will be used if only has one showing child)
          this.onlyOneChild = item
          return true
        }
      })

      // When there is only one child router, the child router is displayed by default
      if (showingChildren.length === 1) {
        return true
      }

      // Show parent if there are no child router to display
      if (showingChildren.length === 0) {
        this.onlyOneChild = { ...parent, path: '', noShowingChildren: true }
        return true
      }

      return false
    },
    resolvePath (routePath, routeQuery) {
      //路径替换

      if (isExternal(routePath)) {
        return routePath;
      }
      if (isExternal(this.basePath)) {
        return this.basePath;
      }
      if (routeQuery) {
        let query = JSON.parse(routeQuery);
        return { path: path.resolve(this.basePath, routePath).replace('/?', '?'), query: query }
      }
      return path.resolve(this.basePath, routePath).replace('/?', '?')
    },
    bingActiveIcon (icon) {
      if (icon.path == '') {
        return require(`@/assets/images/nav/nav6_pre.png`)
      } else {
        icon = icon.name || 'nav6'
        return require(`@/assets/images/nav/${icon}_pre.png`)
      }
    },
    bingIcon (icon) {
      if (icon.path == '') {
        return require(`@/assets/images/nav/nav6.png`)
      } else {
        icon = icon.name || 'nav6'
        return require(`@/assets/images/nav/${icon}.png`)
      }
    },
    mouseenterActive () {
      this.active = true
    },
    mouseleaveActive () {
      this.active = false
    }
  }
}
</script>
<style scoped lang="scss">
.el-menu-item.is-active {
  height: 0.8rem;
  line-height: 0.8rem;
  background: #ffffff;
  border-radius: 0;
  text-align: center;
  font-size: 0.25rem;
  span {
    color: #004ab3;
  }
}
::v-deep .is-active {
  height: 0.8rem;;
  line-height: 0.8rem;;
  background: #ffffff;
  border-radius: 0;
  text-align: center;
  font-size: 0.2625rem;
  span {
    color: #004ab3;
  }
}
::v-deep .el-submenu__title,
::v-deep .el-menu-item {
  text-align: center;
  height: 0.8rem !important;
  line-height: 0.8rem !important;
  font-size: 0.2625rem;
  color: #ffffff;
  background: initial;
}
::v-deep .el-submenu__title:hover,
::v-deep .el-menu-item:hover {
  color: #004ab3;
  background: #ffffff;
}
.nav_icon {
  width: 0.25rem;
  height: 0.25rem;
  margin-right: 0.0625rem;
}
::v-deep .el-menu--horizontal {
  margin-top: 0;
}
.nest-menu111 {
  .el-menu-item {
    .nav_icon {
      display: none;
    }
  }
  .el-menu-item:hover {
    background: #004ab3;
    color: #ffffff;
  }
}
::v-deep .el-submenu__icon-arrow{
  display: none;
}
</style>
