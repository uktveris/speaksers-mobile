import { Router } from "expo-router";

const ROUTES = {
  login: "/login" as const,
  register: "/register" as const,
  authCallback: "/auth-callback" as const,
  languageCourseSelection: "/(protected)/language-course-selection" as const,
  editAccount: "/(protected)/(account)/edit-account" as const,
  dialog: "/(protected)/(dialog)/dialog" as const,
  dialogCall: "/(protected)/(dialog)dialogCall" as const,
  accountTab: "/(protected)/(tabs)/account" as const,
  globalChatTab: "/(protected)/(tabs)/globalChat" as const,
  homeScreen: "/(protected)/(tabs)/" as const,
  settingsAccount: "/(protected)/settings/account" as const,
  settings: "/(protected)/settings/" as const,
  settingsPreferences: "/(protected)/settings/preferences" as const,
};

let router: Router | null = null;

function setRouterInstance(instance: Router) {
  router = instance;
}

function routerReplace(path: any) {
  if (!router) {
    console.log("router is not set, cannot navigate..");
    return;
  }
  router.replace(path);
}

function routerPush(path: any) {
  if (!router) {
    console.log("router is not set, cannot navigate..");
    return;
  }
  router.push(path);
}

export { setRouterInstance, ROUTES, routerPush, routerReplace };
