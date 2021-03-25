const BASE_URL = 'http://api.laoktao.com'
// 不需要登录的接口
const noToken = ['account/login', 'account/reset-password']
let ajaxTimes = 0
let timer  = null

export const request = (params) => {
	let header = { 'content-type': 'application/x-www-form-urlencoded', ...params.header }
	// 判断是否需要登录
	if (!(noToken.indexOf(params.url) >= 0)) {
		// 获取 token
		const token = uni.getStorageSync('token')
		if (!token) {
			uni.navigateTo({
				url: '/pages/login/login'
			})
			return false
		} else {
			// 给请求头添加 token
			header['B-Authorization'] = token
		}
	}
	ajaxTimes++
	// 是否显示loading
	// 加一个是否已有timer定时器的判断，否则有两个同时请求的时候，后者会清除前者的定时器id
	// 而没有清除前者的定时器，导致前者超时，一直显示loading
	if(!timer) {
		timer = setTimeout(() => {
			uni.showLoading({
				title: 'loading',
				mask: true
			})
		}, 800)
	}
	return new Promise((resolve, reject) => {
		uni.request({
			...params,
			header,
			url: BASE_URL + params.url,
			timeout: 6000,
			success(res) {
				if(res.statusCode == 200) {
					if (typeof res.data === 'string') {
						try{
							res.data = JSON.parse(res.data)
						}catch(e){
							//TODO handle the exception
						}
					}
					resolve(res.data)
				} else {
					uni.showToast({
						title: 'Failed',
						icon: 'none'
					})
					return
				}
			},
			fail(err) {
				uni.showToast({
					title: 'Failed',
					icon: 'none'
				})
				reject(err)
			},
			complete() {
				ajaxTimes--
				if (ajaxTimes === 0) {
					// 关闭加载中效果
					uni.hideLoading()
					// 清除定时器，如果请求回来了，就无需loading
					clearTimeout(timer)
					timer = null
				}
			}
		})
	})
}
