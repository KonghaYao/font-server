<template >
    <section>
        <el-row>
            <el-page-header>
                <template #content>
                    <span class="text-large font-600 mr-3"> WebHook 管理 </span>
                </template>
            </el-page-header>

        </el-row>
        <el-row>
            <el-alert title="WebHook 订阅者会接收到系统打包完成信息，然后进行个性化操作" type="success" effect="dark" />
        </el-row>
        <el-row>
            <el-table :data="Result.data.value || []" style="width: 100%">
                <el-table-column label="ID" prop="id" />
                <el-table-column label="URL" prop="url" />
                <el-table-column label="创建日期">
                    <template #default="scope">
                        <div style="display: flex; align-items: center">
                            {{ new Date(scope.row.updated_at).toLocaleString() }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column align="right">
                    <template #header>
                        <el-button size="small" type="success" @click="handleAdd()">✒️ 添加订阅</el-button>
                    </template>
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="handleLogs(scope.$index, scope.row)">📃
                            查看日志</el-button>
                        <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">🗑️
                            删除</el-button>
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


        <!--  创建表单 -->
        <el-drawer v-model="drawer" title="添加订阅" ref="ruleFormRef">
            <el-form :model="form">
                <el-form-item label="订阅 URL">
                    <el-input v-model="form.url" />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="onSubmit">创建</el-button>
                </el-form-item>
            </el-form>
        </el-drawer>

    </section>
</template>
<script setup lang="ts">
import { useAuthStore } from '~/store/useAuthStore';
import { refDebounced } from '@vueuse/core'
import type { FormInstance } from 'element-plus/es/components/form';
const store = useAuthStore()
const search = ref('')
const searchD = refDebounced(search, 1000)
const currentPage = ref(1)
const drawer = ref(false)
const ruleFormRef = ref<FormInstance>()

const Result = useFetch<WebHook[]>(() => store.Root + `/webhook?limit=20&offset=${(currentPage.value - 1) * 20}&q=${searchD.value}`, {
    headers: store.authHeader,
    responseType: "json"
})

interface WebHook {
    url: string
    id: number
}

const handleDelete = (index: number, Item: WebHook) => {
    ElMessageBox.confirm(
        '是否删除 ' + Item.url + " 的 WebHook 订阅",
        'Warning',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(() => {
            return $fetch(store.Root + '/webhook/' + Item.id, { method: "delete", headers: store.authHeader })
        }).then(() => {
            Result.refresh()
            ElMessage({
                type: 'success',
                message: '删除成功',
            })
        })
        .catch(() => {

        })

}
const handleLogs = (index: number, Item: WebHook) => {
    navigateTo('/webhook/logs/' + Item.id)
}

// do not use same name with ref
const form = reactive({
    url: '',
})

const onSubmit = () => {
    $fetch(store.Root + "/webhook", { method: "POST", body: JSON.stringify(form), responseType: "json", headers: store.authHeader }).then((res: any) => {
        ElMessage({ type: "success", message: "创建成功" })

        drawer.value = false
        Result.refresh()

    }).catch(e => {
        ElMessage({ type: "error", message: e.message })

    })

}
const handleAdd = () => {

    drawer.value = true
}

</script>
<style ></style>