<template >
    <section>
        <el-row>
            <el-page-header @back="navigateTo('/webhook')">
                <template #content>
                    <span class="text-large font-600 mr-3"> {{ Result.data.value?.data.url }} 历史记录 </span>
                </template>
            </el-page-header>
        </el-row>
        <el-row>
            <el-table :data="Result.data.value?.logs || []" style="width: 100%">
                <el-table-column label="ID" prop="id" />
                <el-table-column label="状态" prop="state">
                    <template #default="scope">
                        <div style="display: flex; align-items: center">
                            {{ WebHookCBState[scope.row.state] }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="事件" prop="event">
                    <template #default="scope">
                        <div style="display: flex; align-items: center">
                            {{ WebHookEvent[scope.row.event] }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="信息" prop="event" />
                <el-table-column label="创建日期">
                    <template #default="scope">
                        <div style="display: flex; align-items: center">
                            {{ new Date(scope.row.updated_at).toLocaleString() }}
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>
        <el-row justify="space-between">
            <el-col :span="8">
                <el-pagination v-model:current-page="currentPage" small layout="prev, pager, next" :total="5000"
                    class="mt-4" />
            </el-col>
            <el-col :span="8">
                <el-input v-model="search" size="small" placeholder="Type to search" />
            </el-col>
        </el-row>


    </section>
</template>
<script setup lang="ts">
import { useAuthStore } from '~/store/useAuthStore';
import { refDebounced } from '@vueuse/core'
const route = useRoute()
const store = useAuthStore()
const search = ref('')
const searchD = refDebounced(search, 1000)
const currentPage = ref(1)

const Result = useFetch<{ data: WebHook, logs: WebHookLog[] }>(() => store.Root + `/webhook/${route.params.id}?limit=20&offset=${(currentPage.value - 1) * 20}&logs=true&q=${searchD.value}`, {
    headers: store.authHeader,
    responseType: "json"
})
enum WebHookCBState {
    pending = 0,
    success = 1,
    error = 2,
}
enum WebHookEvent {
    NULL = 0,
    /** 切割字体完成 */
    SPLIT_SUCCESS = 1,
    /** 用户上传字体成功 */
    UPLOAD_SUCCESS = 2,
}

interface WebHook {
    url: string
    id: number
}
interface WebHookLog {
    state: number,
    event: number,
    message: string
}

</script>
<style ></style>