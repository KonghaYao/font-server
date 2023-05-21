<template >
    <section>
        <el-row>
            <el-page-header @back="navigateTo('/user-font')">
                <template #content>
                    <span class="text-large font-600 mr-3"> 字体打包记录管理 </span>
                </template>
            </el-page-header>
        </el-row>
        <el-row>
            <el-table :data="Result.data.value || []" style="width: 100%">
                <el-table-column label="ID" prop="id" />
                <el-table-column label="名称" prop="name" />
                <el-table-column label="MD5" prop="md5" />
                <el-table-column label="大小" prop="md5">
                    <template #default="scope">
                        <div style="display: flex; align-items: center">
                            {{ filesize(scope.row.size) }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="创建日期" prop="md5">
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

        </el-row>




    </section>
</template>
<script setup lang="ts">
import { useAuthStore } from '~/store/useAuthStore';
import { refDebounced } from '@vueuse/core'
import type { FormInstance } from 'element-plus/es/components/form';
import type { UploadUserFile } from 'element-plus/es/components/upload/src/upload';
const store = useAuthStore()
const search = ref('')
const searchD = refDebounced(search, 1000)
const currentPage = ref(1)
const drawer = ref(false)
const ruleFormRef = ref<FormInstance>()

const Result = useFetch<FontMessage>(() => store.Root + `/split?limit=5&offset=0&state=2&source=${useRoute().params.id}`, {
    headers: store.authHeader,
    responseType: "json"
})

interface FontMessage {
    updated_at: string
    size: number
    name: string
    id: number
}


</script>
<style ></style>