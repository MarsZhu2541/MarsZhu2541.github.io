const { createApp } = Vue

createApp({
    data() {
        return {
            cacheTime: 0,
            lineupList: [],
        }
    },
    mounted() {
        if (localStorage.getItem("lineuplist") == null || new Date().valueOf() - parseInt(localStorage.getItem("timeLoadLineuplist")) > this.cacheTime) {
            console.log("no cache")
            this.getLineupList()
        } else {
            console.log("use cache")
            this.lineupList = JSON.parse(localStorage.getItem("lineuplist"))
        }
    },
    methods: {
        getLineupList() {
            let that = this

            axios.get('https://game.gtimg.cn/images/lol/act/tftzlkauto/json/totalLineupJson/lineup_total.json?v=2779984')
                .then(res => {
                    that.handleData(res.data)
                })
                .catch(err => {
                    console.log('错误' + err)
                })
        },

        handleData(data) {
            let that = this
            let lineupList = this.lineupList
            let lineup_list = data["lineup_list"]
            lineup_list.sort(this.compareByQuality)
            lineup_list.sort(this.compareBySortID)
            for (i in lineup_list) {
                lineup = lineup_list[i]
                lineUpDetail = JSON.parse(lineup['detail'].replace(/\n/g, "\\n").replace(/\r/g, "\\r"))
                lineUpDetail.quality =  lineup.quality
                lineupList.push(lineUpDetail)
                // console.log(lineUpDetail.line_name+" "+lineup.channel+" "+lineup.quality+" "+lineup.sortID)
            }

            axios.get('https://game.gtimg.cn/images/lol/act/img/tft/js/chess.js')
                .then(res => {
                    that.addCustomData(res.data.data)
                })
                .catch(err => {
                    console.log('错误' + err)
                })
        },
        async getHexMap() {
            rawData = {}
            hexMap = {}
            await axios.get('https://game.gtimg.cn/images/lol/act/img/tft/js/hex.js')
                .then(res => {
                    rawData = res.data
                })
                .catch(err => {
                    console.log('错误' + err)
                })
            for (i in rawData) {
                hexMap[rawData[i].hexId] = rawData[i]
            }
            return hexMap

        },
        async getEquipMap() {
            rawData = {}
            equipMap = {}
            await axios.get('https://game.gtimg.cn/images/lol/act/img/tft/js/equip.js')
                .then(res => {
                    rawData = res.data.data
                })
                .catch(err => {
                    console.log('错误' + err)
                })
            for (i in rawData) {
                equipMap[rawData[i].equipId] = rawData[i]
            }
            return equipMap

        },
        async addCustomData(chessList) {
            let lineupList = this.lineupList
            let chessMap = {};
            let hexMap = await this.getHexMap()
            let equipMap = await this.getEquipMap()
            // console.log(equipMap)
            for (i in chessList) {
                chess = chessList[i]
                chessMap[chess['chessId']] = chess
            }

            for (i in lineupList) {
                lineup = lineupList[i]
                //enhance lineup info

                orderStr = lineup.equipment_order
                orderArr = lineup.equipment_order.split(',')
                while (orderStr[orderStr.length - 1] == ',') {
                    orderStr = orderStr.substr(0, orderStr.length - 1)
                    orderArr.pop()
                }
                for (h in orderArr) {
                    orderStr = orderStr.replace(orderArr[h], equipMap[parseInt(orderArr[h])].name)
                }
                orderStr = orderStr.replaceAll(',', '>')

                lineup.info = "阵容强度： " + lineup.quality + "\n"
                    + "D牌节奏： " + lineup.d_time + "\n"
                    + "早期玩法： " + lineup.early_info + "\n"
                    + "抢装顺序： " + orderStr + "\n\n"
                    + "克制阵容： " + lineup.enemy_info + "\n\n"
                    + "装备推荐： " + lineup.equipment_info + "\n\n"
                    + "海克斯推荐： " + lineup.hex_info + "\n"
                    + "站位推荐： " + lineup.location_info + "\n";

                //enhance hero data
                level_3_heros = lineup['level_3_heros']
                positions = lineup["hero_location"]
                for (j in positions) {
                    position = positions[j]


                    if (position['hero_id'] == undefined || position['hero_id'] == "") {
                        hero_id = parseInt(position['chess_id'])
                    } else {
                        hero_id = parseInt(position['hero_id'])
                    }
                    hero = chessMap[hero_id]
                    if (!(hero == undefined)) {

                        position['price'] = hero.price
                        if (!position['is_carry_hero'] == "") {
                            lineup['bgImagePath'] = 'https://game.gtimg.cn/images/lol/tftstore/s7.5/624x318/' +
                                hero.name.toString().replace('png', 'jpg')
                        }
                        position['name'] = hero.title + " " + hero.displayName
                        position['skillDetail'] = hero.skillDetail
                        position['is_3_star'] = level_3_heros.includes(hero_id)
                        position['hero_image'] = "https://game.gtimg.cn/images/lol/act/img/tft/champions/" + hero.name
                        position['price'] = hero.price
                        position['chessPriceClass'] = "component-champion cost" + hero.price + " champion-main"
                        position['equip_image_list'] = []
                        position.equipment_id = position.equipment_id.split(',')
                        for (k in position.equipment_id) {
                            equipID = position.equipment_id[k]
                            if (!(equipMap[equipID] == undefined)) {
                                position['equip_image_list'].push(equipMap[equipID].imagePath)
                            }

                        }
                    }
                }
                positions.sort(this.compareHero)
                //enhance hex data
                hexIDList = lineup.hexbuff.recomm.split(",")
                lineup.hexbuff.recomm = []
                for (i in hexIDList) {
                    hexID = hexIDList[i]
                    if (!(hexMap[hexID] == undefined)) {
                        lineup.hexbuff.recomm.push(hexMap[hexID])
                    }

                }
            }
            console.log(lineupList)
            localStorage.setItem("timeLoadLineuplist", new Date().valueOf().toString())
            localStorage.setItem("lineuplist", JSON.stringify(this.lineupList))
        },
        showInfo(info) {
            alert(info)
        },
        compareByQuality(a, b) {
            if(a.quality==""||a.quality=="0"){
                a.quality = "C"
            }
            if(b.quality==""||b.quality=="0"){
                b.quality = "C"
            }
            qualityMap= {"S":0,"A":1,"B":2,"C":3,"":100}
            a_tag = qualityMap[a.quality]
            b_tag = qualityMap[b.quality]
            if (a_tag < b_tag) {
                return -1;
            } else if (a_tag > b_tag) {
                return 1;
            }
            return 0;
        },
        compareBySortID(a, b) {
            aID =parseInt(a.sortID)
            bID =parseInt(b.sortID)
            if (aID<bID) {
                return 1;
            } else if (aID>bID) {
                return -1;
            }
            return 0;
        },
        compareHero(a,b){
            if(a.is_3_star&&!b.is_3_star){
                return -1;
            }else if(b.is_3_star&&!a.is_3_star){
                return 1;
            }else{
                if(a.is_carry_hero&&!(b.is_carry_hero)){
                    return -1;
                }else if(b.is_carry_hero&&!(a.is_carry_hero)){
                    return 1;
                }
                return 0
            }
        }
    },
}).mount('#app')

