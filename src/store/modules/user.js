import { defineStore } from 'pinia';
import sysUserApi from '@/api/system/sys_user.js';
// 动态导入拿到所有页面 eg: {/src/views/test/index.vue: () => import("/src/views/test/index.vue")}
const views = import.meta.glob('@/views/**/**.vue');
import { useRoute, useRouter } from 'vue-router';
import store from '@/store';

export const useUserStore = defineStore('user', () => {
  const route = useRoute();
  const router = useRouter();
  let isLogin = ref(false);
  let tokenObj = ref({});
  let userObj = ref({});
  let routerMap = ref({}); // 全路径'/system/user' -> 路由信息

  // 登录
  async function login(loginObj) {
    console.log('loginObj', loginObj);

    isLogin.value = true;
    console.log('isLogin.value', isLogin.value);
    let fixedData = {
      "isLogin":true,
	"tokenObj":{},
	"userObj":{
		"avatarUrl":"",
		"createTime":"2020-08-22 15:01:55",
		"email":"826199528@qq.com",
		"nickname":"小仔",
		"roleCodeList":["super_admin"],
		"sex":1,
		"sexName":"男",
		"phone":"15188888888",
		"userId":1,
		"username":"admin",
		"permissionTreeList":[
		{"menuId":1,"parentId":0,"parentName":"","title":"首页","icon":"Setting","path":"/mall","children":[],"component":"dashboard/index","isHasPerm":true,"isShow":true,"isShowBreadcrumb":"true","permList":[]},
		]
	},
    }
    userObj.value = fixedData.userObj;
    console.log('userObj', userObj.value);
    if (isLogin.value) {
      return;
    }
    let result = await sysUserApi.login({
      username: loginObj.username.trim(),
      password: loginObj.password.trim(),
    });
    isLogin.value = true;
    tokenObj.value = result.data;
    getUserInfo();
  }

  // 退出登录
  function logout() {
    // 清空pinia存储的数据
    this.$reset();

    store.settings.useSettingsStore().$reset();

    // window.localStorage.setItem('user2', 'hello');
    // window.localStorage.removeItem('user2');
    // tips: pinia持久化的无法通过这种方式清空数据，只能删除同样方式存储的值 eg: window.localStorage.setItem('user2', 'hello');
    window.localStorage.clear();
    window.sessionStorage.clear();

    // 跳转登录页
    router.push(`/login?redirect=${route.fullPath}`);
    // window.location.href = '/login';
    location.reload(); // 强制刷新页面
  }

  // 获取用户 & 权限数据
  async function getUserInfo() {
    let result = await sysUserApi.getUserPerm();
    userObj.value = result.data;


    // 初始化系统设置数据
    // store.system.useSystemStore().init();
  }

  const routerList = computed(() => {
    // 拿到后台的权限数据
    return generateRouterList({}, userObj.value.permissionTreeList);
  });

  // 生成侧边栏菜单 & 权限路由数据
  function generateRouterList(parentObj, permList) {
    let result = [];
    if (!permList || permList.length === 0) {
      return result;
    }

    for (let index = 0; index < permList.length; index++) {
      let permItem = permList[index];

      // 填充字段数据
      if (!permItem.meta) {
        permItem.meta = {};
      }
      if (!permItem.meta.isParentView) {
        permItem.meta.isParentView = false;
      }
      if (!permItem.meta.sort) {
        permItem.meta.sort = 10000;
      }

      let title = permItem.meta.title;
      if (title) {
        if (parentObj.meta) {
          // [子级]
          // 面包屑数据
          permItem.meta.breadcrumbItemList = parentObj.meta.breadcrumbItemList.concat([title]);
          // 全路径
          permItem.meta.fullPath = parentObj.meta.fullPath + '/' + permItem.path;
        } else {
          // [顶级]
          permItem.meta.breadcrumbItemList = [title];
          permItem.meta.fullPath = permItem.path;
        }
      }

      // 组件页面显示处理
      permItem.component = views[`/src/views/${permItem.component}.vue`];

      routerMap.value[permItem.meta.fullPath] = permItem;

      // 递归处理
      if (permItem.children.length > 0) {
        permItem.children = generateRouterList(permItem, permItem.children);
      }

      result.push(permItem);
    }

    // 从小到大 升序
    result = result.sort((a, b) => {
      return a.meta.sort - b.meta.sort;
    });
    return result;
  }

  return { isLogin, login, logout, tokenObj, userObj, getUserInfo, routerList, routerMap };
});
