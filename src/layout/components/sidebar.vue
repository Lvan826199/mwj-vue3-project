<template>
  <div class="menu">
    <h1 class="flex-center-center p-y-10 text-color-primary" style="width: 200px">MwjVue3</h1>
    <el-menu v-if="menuType === 1" router :default-active="$route.meta.fullPath" :collapse="false" :unique-opened="false" @select="handleSelect">
      <el-scrollbar>
        <sidebar-item :router-list="routerList" />
      </el-scrollbar>
    </el-menu>
    <div v-else class="p-x-20 p-y-10">
      <div v-for="item in routerList.filter((e) => e.meta.isShow)" :key="item.path">
        <div class="font-bold cursor-pointer" @click="handleSelect(item.meta.fullPath)">
          <el-icon v-if="item.meta && item.meta.icon" size="12"><component :is="item.meta.icon" /></el-icon>
          {{ item.meta.title }}
        </div>
        <div class="grid-start-center-2 m-t-10 m-b-10">
          <div v-for="secondItem in item.children.filter((e) => e.meta.isShow)" :key="secondItem.path" class="text-color-grey" style="height: 25px">
            <div
              class="cursor-pointer"
              :class="{
                'text-color-primary': $route.meta.fullPath === secondItem.meta.fullPath,
              }"
              @click="handleSelect(secondItem.meta.fullPath)">
              {{ secondItem.meta.title }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import sidebarItem from './sidebar-item.vue';
import { getCurrentInstance, toRefs } from 'vue';
const { proxy } = getCurrentInstance();
let { routerList, routerMap } = toRefs(proxy.$store.user.useUserStore());
let { activeTabs } = proxy.$store.settings.useSettingsStore();
let { menuType } = toRefs(proxy.$store.settings.useSettingsStore());

/**
 * 选中菜单时触发
 * @param index 选中菜单项的 index  eg: /system/role （router 以 index 作为 path 进行路由跳转，或 router 属性直接跳转）
 * @param indexPath 选中菜单项的 index path eg: ['/system', '/system/role']
 * @param item 选中菜单项
 * @param routeResult vue-router 的返回值（如果 router 为 true）
 */
function handleSelect(index, indexPath, item, routeResult) {
  // console.log(index, indexPath, item, routeResult);
  let router = routerMap.value[index];
  if (router.children.length > 0) {
    return;
  }
  if (menuType.value === 2) {
    proxy.$router.push(index);
  }
  activeTabs(router);
}
</script>

<style lang="scss" scoped>
.menu {
  box-shadow: 1px 0 5px rgba(0, 0, 0, 0.2);
}
</style>
