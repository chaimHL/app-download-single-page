<template>
	<view class="bg">
    <view class="main">
      <!-- 二维码 -->
      <view class="qr-wrap">
        二维码
      </view>
      <view class="qr-text">APP</view>
      <!-- 按钮 -->
      <view class="btn-wrap">
        <u-button :ripple="true" ripple-bg-color="#3BC3F3" type="primary" class="btn">
          <view class="icon-wrap">
            <u-image src="@/static/img/app.png" mode="widthFix"></u-image>
          </view>
          APP
        </u-button>
        <u-button :ripple="true" ripple-bg-color="#3BC3F3" type="primary" class="btn">
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
	import api from '@/common/api/index.js'
	export default {
		data() {
			return {

			}
		},
		computed: {}
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
    top: 34vh;
    left: 50%;
    transform: translateX(-50%);
  }
  .qr-wrap {
    margin: 0 auto 20rpx;
    width: 270rpx;
    height: 270rpx;
    border-radius: 10rpx;
    background-color: #E9E9EB;
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
