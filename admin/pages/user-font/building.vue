<template >
    <section style="height:100%">
        <el-row>
            <el-page-header @back="navigateTo('/user-font')">
                <template #content>
                    <span class="text-large font-600 mr-3"> 打包字体中，请勿关闭 </span>
                </template>
            </el-page-header>
        </el-row>
        <client-only>
            <terminal name="my-terminal" :show-header="false" :enable-example-hint="false"></terminal>
        </client-only>




    </section>
</template>
<script setup lang="ts">
import { useAuthStore } from '~/store/useAuthStore';
import Terminal from 'vue-web-terminal'
import { api as TerminalApi } from "vue-web-terminal"

const store = useAuthStore()
const search = ref('')

const route = useRoute()

ElMessageBox({
    title: "是否打包 " + route.query.name ?? route.query.id + "?"
    , message: "✅ 打包过程大概30秒，请勿关闭页面，点击确认开始打包，可以取消"
}).then(() => {
    TerminalApi.pushMessage('my-terminal', '发送打包事件中。。。')
    const fd = new FormData()
    fd.set('md5', route.query.md5! as string)
    fd.set('id', route.query.id! as string)
    console.log(fd)
    return fetch(store.Root + `/split`, {
        headers: store.authHeader,
        method: "post",
        body: fd
    }).then(res => res.body!.pipeThrough(new TextDecoderStream()).pipeTo(new WritableStream({
        write(text) {

            //  调用API
            TerminalApi.pushMessage('my-terminal', text + '\n')
        }, close() {
            TerminalApi.pushMessage('my-terminal', '程序执行完毕，可以退出窗口了\n')
        }

    })))
}).catch((e) => {
    ElMessage({ type: "error", message: e.message })
})



</script>
<style ></style>