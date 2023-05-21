<template >
    <section>
        <el-row>
            <el-page-header>
                <template #content>
                    <span class="text-large font-600 mr-3"> 字体管理 </span>
                </template>
            </el-page-header>
        </el-row>
        <el-row>
            <el-alert title="这些是用户上传的原始字体, 在系统的 /user-fonts 文件夹下" type="success" effect="dark" />
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
                <el-table-column label="创建日期">
                    <template #default="scope">
                        <div style="display: flex; align-items: center">
                            {{ new Date(scope.row.updated_at).toLocaleString() }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="打包版本数">
                    <template #default="scope">
                        <div style="display: flex; align-items: center">
                            {{ scope.row.versions.length }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column align="right">
                    <template #header>
                        <el-button size="small" type="success" @click="handleAdd()">✒️ 添加字体</el-button>
                    </template>
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="handleDetail(scope.$index, scope.row)">📃
                            打包记录</el-button>
                        <el-button size="small" type="warning"
                            @click="navigateTo(`/user-font/building?md5=${scope.row.md5}&id=${scope.row.id}&name=${scope.row.name}`)">📦
                            打包此文件</el-button>
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
        <el-drawer v-model="drawer" title="添加字体" ref="ruleFormRef">
            <el-form :model="form" v-loading="loading">
                <el-form-item label="名称">
                    <el-input v-model="form.name" />
                </el-form-item>
                <el-form-item label="上传文件">
                    <el-upload v-model:file-list="form.font" :auto-upload="false">
                        <el-button type="primary">加入字体文件</el-button>
                    </el-upload>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="onSubmit">创建</el-button>
                </el-form-item>
            </el-form>
        </el-drawer>

    </section>
</template>
<script setup lang="ts">
import { filesize } from 'filesize'
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

const Result = useFetch<FontMessage[]>(() => store.Root + `/fonts?limit=20&offset=${(currentPage.value - 1) * 20}&versions=true&q=${searchD.value}`, {
    headers: store.authHeader,
    responseType: "json"
})

interface FontMessage {
    updated_at: string
    size: number
    name: string
    id: number
}


// do not use same name with ref
const form = reactive({
    name: '',
    font: [] as UploadUserFile[]
})

const loading = ref(false)
const onSubmit = () => {
    loading.value = true
    const fd = new FormData()
    try {
        fd.set('name', form.name)
        fd.set('font', form.font[0].raw!)
    } catch (e) {
        loading.value = false
        return
    }
    return $fetch(store.Root + "/fonts", { method: "POST", body: fd, responseType: "json", headers: store.authHeader }).then((res: any) => {
        ElMessage({ type: "success", message: "创建成功" })

        drawer.value = false
        Result.refresh()

    }).catch(e => {
        ElMessage({ type: "error", message: e.message })

    }).finally(() => (loading.value = false))

}
const handleDetail = (index: number, Item: FontMessage) => {
    navigateTo('/user-font/detail/' + Item.id)
}
const handleAdd = () => {

    drawer.value = true
}

</script>
<style ></style>