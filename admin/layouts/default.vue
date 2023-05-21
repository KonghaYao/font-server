<template>
    <el-container class="container">

        <el-container>
            <el-aside width="200px">
                <el-menu class="container" router>

                    <el-menu-item index="/">🎛️ 管理面板
                    </el-menu-item>
                    <el-menu-item index="/user-font">📁 字体管理
                    </el-menu-item>
                    <el-menu-item index="/result-font">📦 打包管理
                    </el-menu-item>
                    <el-menu-item index="/webhook">🤖 WebHook
                    </el-menu-item>
                </el-menu>
            </el-aside>
            <el-main>
                <slot />
            </el-main>
        </el-container>
    </el-container>
</template>
<style scoped>
.container {
    height: 100%;
}
</style>