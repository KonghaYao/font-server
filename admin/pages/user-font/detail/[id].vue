<template >
    <section>
        <el-row>
            <el-page-header @back="navigateTo('/user-font')">
                <template #content>
                    <span class="text-large font-600 mr-3"> 字体 ID={{ useRoute().params.id }} 打包记录 </span>
                </template>
            </el-page-header>
        </el-row>
        <el-row>
            <el-table :data="Result.data.value?.versions || []" style="width: 100%">
                <el-table-column label="ID" prop="id" />
                <el-table-column label="文件夹" prop="folder" />
                <el-table-column label="状态" prop="state">
                    <template #default="scope">
                        <div style="display: flex; align-items: center">
                            {{ SplitEnum[scope.row.state] }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="文件数目" prop="">
                    <template #default="scope">
                        <div style="display: flex; align-items: center">
                            {{ scope.row.files?.length || 0 }}
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
const store = useAuthStore()
const currentPage = ref(1)

enum SplitEnum {
    "➡️ idle" = 0,
    "🔪 cutting" = 1,
    "✅ success" = 2,
}
const Result = useFetch<FontMessage>(() => store.Root + `/fonts/${useRoute().params.id}?versions=true`, {
    headers: store.authHeader,
    responseType: "json"
})

interface FontMessage {
    updated_at: string
    size: number
    name: string
    id: number
    versions: []
}


</script>
<style ></style>