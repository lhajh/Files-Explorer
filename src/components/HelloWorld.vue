<template>
  <div
    class="hello"
    onselectstart="return false"
  >
    <div class="el-breadcrumb">
      <span
        class="el-breadcrumb__item"
        v-for="(item, index) in breadcrumbList"
        :key="index"
      >
        <span
          class="el-breadcrumb__item__inner"
          @click="breadcrumbClick(index)"
        >{{item.name}}</span>
        <span class="el-breadcrumb__separator">&gt;</span>
      </span>
    </div>
    <el-table
      v-if="isRoot"
      key="root"
      :data="rootFolder"
      style="width: 100%"
      border
      highlight-current-row
      @row-dblclick="handleRootFolder"
    >
      <el-table-column
        prop="DriveLetter"
        label="名称"
      ></el-table-column>
      <el-table-column
        prop="DriveType"
        label="类型"
      ></el-table-column>
      <el-table-column
        prop="FileSystem"
        label="文件系统"
      ></el-table-column>
      <el-table-column
        prop="FreeSpace"
        label="剩余空间容量"
      ></el-table-column>
      <el-table-column
        prop="TotalSize"
        label="总容量"
      ></el-table-column>
      <el-table-column
        prop="Path"
        label="路径"
      ></el-table-column>
      <el-table-column
        prop="ShareName"
        label="网络共享名"
      ></el-table-column>
      <el-table-column
        prop="VolumeName"
        label="卷标名"
      ></el-table-column>
    </el-table>
    <el-table
      v-else
      key="sub"
      :data="subFolder"
      style="width: 100%"
      border
      highlight-current-row
      @row-dblclick="handleSubFolder"
      :default-sort = "{prop: 'Name'}"
    >
      <el-table-column
        prop="Name"
        label="名称"
        show-overflow-tooltip
        sortable
      >
        <template slot-scope="scope">
          <i :class="['fa', `${scope.row.Icon}`]"></i>
          <span style="margin-left: 10px">{{scope.row.Name}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="DateCreated"
        label="日期"
        width="150"
        sortable
      ></el-table-column>
      <el-table-column
        prop="Path"
        label="路径"
        show-overflow-tooltip
        sortable
      ></el-table-column>
      <el-table-column
        prop="Size"
        label="大小"
        width="100"
        sortable
      ></el-table-column>
      <el-table-column
        prop="Type"
        label="类型"
        width="200"
        show-overflow-tooltip
        sortable
      ></el-table-column>
    </el-table>
  </div>
</template>

<script>
import fileIcon from '../constants/fileIcon'
// import { subName } from '../utils'
export default {
  name: 'HelloWorld',
  data() {
    return {
      showList: true,
      isRoot: true,
      breadcrumbList: [
        {
          name: '计算机',
          path: ''
        }
      ],
      rootFolder: [],
      subFolder: [],
      basePath: '',
      fso: new window.ActiveXObject('Scripting.FileSystemObject'),
      fileIcon
    }
  },
  methods: {
    // 点击根目录
    handleRootFolder(row) {
      this.basePath = row.Path + '\\'
      this.breadcrumbList.push({
        name: row.DriveLetter,
        path: this.basePath
      })
      this.getSubFolder()
    },
    handleSubFolder(row) {
      if (row.Type === '文件夹') {
        this.basePath = this.basePath + row.Name + '\\'
        this.breadcrumbList.push({
          name: row.Name,
          path: this.basePath
        })
        this.getSubFolder()
      } else {
        this.openFiles(this.basePath + row.Name)
      }
    },
    breadcrumbClick(index) {
      this.breadcrumbList = this.breadcrumbList.splice(0, index + 1)
      this.basePath = this.breadcrumbList[index].path
      if (this.basePath) {
        this.getSubFolder()
      } else {
        this.getRootFolder()
      }
    },
    getRootFolder() {
      this.isRoot = true
      this.rootFolder = []
      // Enumerator: 将集合转换为对象
      const drives = new window.Enumerator(this.fso.Drives)
      for (; !drives.atEnd(); drives.moveNext()) {
        const item = drives.item()
        this.rootFolder.push({
          DriveLetter: item.DriveLetter,
          DriveType: this.formatDriveType(item.DriveType),
          FileSystem: item.FileSystem,
          FreeSpace: this.bytesToSize(item.FreeSpace),
          Path: item.Path,
          ShareName: item.ShareName,
          TotalSize: this.bytesToSize(item.TotalSize),
          VolumeName: item.VolumeName
        })
      }
    },
    getSubFolder() {
      if (!this.fso.FolderExists(this.basePath)) {
        this.$message.warning('<' + this.basePath + '>该文件夹路径不存在，或者路径不能含文件名！')
        return
      }
      this.isRoot = false
      this.subFolder = []
      const folder = this.fso.GetFolder(this.basePath)
      const files = new window.Enumerator(folder.Files)
      const subFolders = new window.Enumerator(folder.SubFolders)

      for (; !subFolders.atEnd(); subFolders.moveNext()) {
        this.subFolder.push(this.getInfo(subFolders.item()))
      }

      for (; !files.atEnd(); files.moveNext()) {
        this.subFolder.push(this.getInfo(files.item()))
      }
    },
    getInfo(file) {
      let info = {}
      info.Attributes = file.Attributes
      // debugger
      info.Name = file.Name
      info.DateCreated = this.$moment(new Date(file.DateCreated)).format('YYYY/MM/DD hh:mm')
      info.Path = file.Path
      info.Type = file.Type
      if (file.Type === '文件夹') {
        info.Icon = 'fa-folder-o'
      } else {
        info.Size = this.bytesToSize(file.Size)
        for (const key in this.fileIcon) {
          if (this.fileIcon.hasOwnProperty(key)) {
            const extension = this.fso.GetExtensionName(file.Path)
            if (this.fileIcon[key].test(extension)) {
              info.Icon = key
              break
            }
          }
        }
      }
      return info
    },
    bytesToSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))

      return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i]
    },
    formatDriveType(type) {
      // Unknown 0 无法确定驱动器类型。
      // Removable 1 可移动媒体驱动器，包括软盘驱动器和其他多种存储设备。
      // Fixed 2 固定（不可移动）媒体驱动器，包括所有硬盘驱动器（包括可移动的硬盘驱动器）。
      // Remote 3 网络驱动器，包括网络上任何位置的共享驱动器。
      // CDROM 4 CD-ROM 驱动器，不区分只读和可读写的 CD-ROM 驱动器。
      // RAMDisk 5 RAM 磁盘，在本地计算机中占用一块“随机存取内存”(RAM) 虚拟为磁盘驱动器。
      switch (type) {
        case 1:
          return '可移动媒体驱动器'
        case 2:
          return '固定媒体驱动器'
        case 3:
          return '网络驱动器'
        case 4:
          return 'CD-ROM 驱动器'
        case 5:
          return 'RAM 磁盘'
        default:
          return '未知驱动器'
      }
    },
    openFiles(path) {
      try {
        let shell = new window.ActiveXObject('wscript.shell')
        if (shell) {
          shell.Run(path, 1, false)
          // shell.run("osk") /*打开屏幕键盘*/
          shell = null
        }
      } catch (e) {
        this.$message.warning(e.message || 'Windows 无法打开此文件')
      }
    }
  },
  created() {
    this.getRootFolder()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
.el-breadcrumb {
  font-size: 14px;
  margin-bottom: 15px;
  .el-breadcrumb__item__inner {
    color: #20a0ff;
    cursor: pointer;
  }
  .el-breadcrumb__item:last-child .el-breadcrumb__item__inner {
    color: rgb(102, 102, 102) !important;
    cursor: auto;
  }
}
</style>
