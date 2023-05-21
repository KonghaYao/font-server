<template>
  <h1>欢迎来到中文网字计划的字体服务器</h1>
  <blockquote> 下面是系统配置，你可以随时进行更改，这些更改只发生在你的浏览器中</blockquote>
  <el-form :model="form" label-width="120px">
    <el-form-item label="后端服务器地址">
      <el-input v-model="form.root" />
    </el-form-item>
    <el-form-item label="Admin Token">
      <el-input type="password" show-password v-model="form.token" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">更改</el-button>
      <el-button @click="reset">重置</el-button>
    </el-form-item>
  </el-form>
</template>
<script lang="ts" setup>
import { useAuthStore } from '~/store/useAuthStore';


const store = useAuthStore()
// do not use same name with ref
const form = reactive({
  root: store.Root,
  token: store.access_token
})
const onSubmit = () => {
  store.$patch({
    Root: form.root,
    access_token: form.token
  })
  ElMessage({ type: 'success', message: "修改完成" })
}
const reset = () => {
  form.root = store.Root
  form.token = store.access_token
}
</script>
<style scoped></style>