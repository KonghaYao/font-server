<template >
    <section>
        <el-row>
            <el-page-header @back="navigateTo('/user-font')">
                <template #content>
                    <span class="text-large font-600 mr-3"> 📦 字体打包记录 </span>
                </template>
            </el-page-header>
        </el-row>
        <el-row>
            <el-alert title="这是全部字体文件的打包记录" type="success" effect="dark" />
        </el-row>
        <el-row>
            <el-table :data="Result.data.value || []" style="width: 100%">
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
                            {{ scope.row.files.length }}
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
                <el-table-column align="right">


                    <template #default="scope">
                        <el-button size="small" type="primary" @click="navigateTo('/user-font/detail/' + scope.row.id)">📃
                            原始文件</el-button>

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
const Result = useFetch<FontMessage[]>(() => store.Root + `/split?limit=20&offset=${(currentPage.value - 1) * 20}`, {
    headers: store.authHeader,
    responseType: "json"
})

interface FontMessage {
    updated_at: string

    id: number
    folder: string;
    files: []
    state: number
}


</script>
<style ></style>