import axios from 'axios';
import qs from 'qs';
import Vue from 'vue';

var option = {};
if (Vue.config.devtools)
  option = {
    baseURL: 'https://m.hanzhipu.ab/wenda/activity',
  };
else
  option = {
    baseURL: 'https://m.mafengwo.cn/wenda/activity',
    withCredentials: true,
  };
var instance = axios.create(option);

var axios_ = {
  post(url, data) {
    return new Promise((resolve, reject) => {
      instance
        .post(url, qs.stringify(data))
        .then((response) => {
          resolve(response.data);
        })
        .catch((response) => {
          reject(response.data);
        });
    });
  },
  get(url, data) {
    return new Promise((resolve, reject) => {
      let data_ = {
        params: data ? data : '',
      };
      instance.get(url, data_).then(
        (response) => {
          if (response.data.error && response.data.error.code == 400) {
            location.href = 'https://m.mafengwo.cn/404.php';
          }
          resolve(response.data);
        },
        (response) => {
          reject(response.data);
        }
      );
    });
  },
};

export default axios_;
