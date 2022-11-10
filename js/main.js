var app = new Vue({
    el: '#app',
    data: {
        ans: [
            [
                [2, 1, 1]
            ],
            [
                [1, 2, 1],
                [2, 3, 1]
            ],
            [
                [1, 1, 2],
                [1, 2, 3],
                [2, 1, 3],
                [2, 3, 5]
            ]
        ],
        text: "",
        n: null,
        k: null,
        tableData: []
    },

    methods: {
        conf() {
            let n = this.n  
            let k = this.k
            let ans = this.ans          //ans存比例，tableData存显示数据
            this.tableData = []
            if (ans[n - 1] == null) {   //ans[n-1]代表第n次的比列数组，若尚未算出，调用函数算出比例
                this.figureTo(n - 1)
            }
            for (let i = 0; i < ans[n - 1].length; i++) {
                var base = 0
                var flag = false; //标记是否能除尽，能否生成答案
                switch (n % 3) {  //不同的人猜出来的分类
                    case 1:
                        if (k % ans[n - 1][i][0] != 0) {
                            break;
                        }
                        base = k / ans[n - 1][i][0]
                        flag = true
                        break;
                    case 2:
                        if (k % ans[n - 1][i][1] != 0) {
                            break;
                        }
                        base = k / ans[n - 1][i][1]
                        flag = true
                        break;
                    case 0:
                        if (k % ans[n - 1][i][2] != 0) {
                            break;
                        }
                        base = k / ans[n - 1][i][2]
                        flag = true
                        break;
                }
                if (flag) { //存入数据进行显示
                    this.tableData.push({  
                        numA: base * ans[n - 1][i][0],
                        numB: base * ans[n - 1][i][1],
                        numC: base * ans[n - 1][i][2],
                    })
                }

            }

            if (this.tableData.length != 0) this.text = "第" + this.n + "次猜出，猜出的值为" + this.k + "的情况："
            else this.text = "输入不合理（产生小数）"
        },
        figureTo(n) { //算到ans[n]

            if (this.ans[n - 1] == null) { //前一个比列未算出
                this.figureTo(n - 1)
            }
            this.ans[n] = []
            let index = n % 3 //当前数在数组中的下标，例如 输入n=4，传到figureTo时n=3，是第1个人算出来的，下标为0
            let index_other1 = (index + 1) % 3, //另两个数的下标
                index_other2 = (index + 2) % 3

            for (let i = 0; i < this.ans[n - 2].length; i++) {  //利用前面第二个人的推断开始推
                let old = this.ans[n - 2][i][index],
                    other1 = this.ans[n - 2][i][index_other1],
                    other2 = this.ans[n - 2][i][index_other2],
                    tempans = []

                tempans[index_other1] = other1
                tempans[index_other2] = other2
                if (old == Math.abs(other1 - other2))
                    tempans[index] = other1 + other2
                else
                    tempans[index] = Math.abs(other1 - other2)

                this.ans[n].push(tempans)
            }
            for (let i = 0; i < this.ans[n - 1].length; i++) { //利用前面第一个人的推断开始推
                let old = this.ans[n - 1][i][index],
                    other1 = this.ans[n - 1][i][index_other1],
                    other2 = this.ans[n - 1][i][index_other2],
                    tempans = []
                tempans[index_other1] = other1
                tempans[index_other2] = other2
                if (old == Math.abs(other1 - other2))
                    tempans[index] = other1 + other2
                else
                    tempans[index] = Math.abs(other1 - other2)

                this.ans[n].push(tempans)

            }

        },
    },

})
