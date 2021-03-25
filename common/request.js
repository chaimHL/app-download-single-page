const BASE_URL = 'http://13.229.227.232'

export const request = (params) => {
	let header = { 'content-type': 'application/x-www-form-urlencoded', ...params.header }
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
			}
		})
	})
}
