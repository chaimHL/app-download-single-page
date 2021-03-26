<template>
	<view class="bg">
    <view class="main">
      <!-- 二维码 -->
      <view class="qr-wrap">
        <ay-qrcode ref="qrcode" :modal="modal_qr" :url="qrUrl" @hideQrcode="hideQrcode" :height="135" :width="135" />
      </view>
      <view class="qr-text">Scan code to download APP <br> 扫码下载 APP </view>
      <!-- 按钮 -->
      <view class="btn-wrap">
        <!-- 下载 APP -->
        <u-button :ripple="true" ripple-bg-color="#3BC3F3" type="primary" class="btn" @click="handleGetApp">
          <view class="icon-wrap">
            <u-image src="@/static/img/app.png" mode="widthFix"></u-image>
          </view>
          APP
        </u-button>
        <!-- 下载 PDA -->
        <u-button :ripple="true" ripple-bg-color="#3BC3F3" type="primary" class="btn" @click="handleGetPda">
          <view class="icon-wrap">
            <u-image src="@/static/img/pda.png" mode="widthFix"></u-image>
          </view>
          PDA
        </u-button>
      </view>

    </view>
	</view>
</template>

<script>
  import ayQrcode from "@/components/ay-qrcode/ay-qrcode.vue"
	import { getApp, getPda } from '@/common/api/index.js'

	export default {
    components: {
      ayQrcode
    },
		data() {
			return {
        // 二维码相关参数
        modal_qr: false,
        qrUrl: "", // 要生成的二维码值
        pixelRatio: 0 // 获取设备像素比，解决二维码居中的问题
			}
		},
    onLoad() {
     this.showQrcode() // 加载生成二维码
    },
		methods: {
      // 展示二维码
      showQrcode() {
          let _this = this;
          this.modal_qr = true;
          getApp('安卓').then(res => {
            this.qrUrl = res.data.url
            this.$nextTick(() => {
              _this.$refs.qrcode.crtQrCode()
            })
          })
      },

      //传入组件的方法
      hideQrcode() {
        this.modal_qr = false;
      },

      // 点击下载 app
      handleGetApp() {
        getApp('安卓').then(res => {
          this.qrUrl = res.data.url
          location.href = res.data.url
        })
      },

      // 点击下载 pda
      handleGetPda() {
        getPda().then(res => {
          location.href = res.data.url
        })
      }
    }
	}
</script>

<style lang="scss" scoped>
  .bg {
    position: relative;
    width: 100vw;
    height: 100vh;
    background: url('@/static/img/bg-min.jpg') no-repeat;
    background-size: 100% 100%;
  }
  .main {
    position: absolute;
    top: 32vh;
    left: 50%;
    transform: translateX(-50%);
  }
  .qr-wrap {
    margin: 0 auto 28rpx;
    width: 135px;
    height: 135px;
    border-radius: 10rpx;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .qr-text {
    text-align: center;
  }
  .btn-wrap {
    margin-top: 40rpx;
    .btn {
      width: 460rpx;
      height: 88rpx;
      background: #01B0EF;
      box-shadow: 4rpx 12rpx 26rpx 3rpx rgba(0, 165, 224, 0.13);
      border-radius: 10rpx;
      margin-bottom: 50rpx;
    }
    .icon-wrap {
      width: 26rpx;
      height: 40rpx;
      margin-right: 16rpx;
    }
  }

</style>
