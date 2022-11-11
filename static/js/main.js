const { createApp } = Vue

createApp({
    data() {
        return {
            lineupList: [],
        }
    },
    mounted() {
        this.getLineupList()
    },
    methods: {
        getLineupList() {
            let that = this

            axios.get('https://game.gtimg.cn/images/lol/act/tftzlkauto/json/totalLineupJson/lineup_total.json?v=2779984')
                .then(res => {
                    // console.log(res.data)
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
            details = []
            for (i in lineup_list) {
                lineup = lineup_list[i]
                lineupList.push(JSON.parse(lineup['detail'].replace(/\n/g, "\\n").replace(/\r/g, "\\r")))
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
            rawData= {}
            hexMap = {}
            await axios.get('https://game.gtimg.cn/images/lol/act/img/tft/js/hex.js')
                .then(res => {
                    rawData = res.data
                })
                .catch(err => {
                    console.log('错误' + err)
                })
            for(i in rawData){
                hexMap[rawData[i].hexId] = rawData[i]
            }
            return hexMap
        
        },
        async getEquipMap() {
            rawData= {}
            equipMap = {}
            await axios.get('https://game.gtimg.cn/images/lol/act/img/tft/js/equip.js')
                .then(res => {
                    rawData = res.data.data
                })
                .catch(err => {
                    console.log('错误' + err)
                })
            for(i in rawData){
               equipMap[rawData[i].equipId] =rawData[i]
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

                orderStr=lineup.equipment_order
                orderArr = lineup.equipment_order.split(',')
                while(orderStr[orderStr.length-1]==','){
                    orderStr = orderStr.substr(0,orderStr.length-1)
                    orderArr.pop()
                }
                for(h in orderArr){
                    orderStr = orderStr.replace(orderArr[h],equipMap[parseInt(orderArr[h])].name)   
                }
                orderStr = orderStr.replaceAll(',','>')

                lineup.info= "D牌节奏： "+lineup.d_time+"\n"
                +"早期玩法： "+lineup.early_info+"\n"
                +"抢装顺序： "+orderStr+"\n\n"
                +"克制阵容： "+lineup.enemy_info+"\n\n"
                +"装备推荐： "+lineup.equipment_info+"\n\n"
                +"海克斯推荐： "+lineup.hex_info+"\n"
                +"站位推荐： "+lineup.location_info+"\n";

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
                        position['chessPriceClass'] = "component-champion cost"+hero.price +" champion-main"
                        position['equip_image_list']=[]
                        position.equipment_id = position.equipment_id.split(',')
                        for(k in position.equipment_id){
                            equipID = position.equipment_id[k] 
                            if(!(equipMap[equipID]==undefined)){
                                position['equip_image_list'].push(equipMap[equipID].imagePath)  
                            }
                            
                        }
                    }
                }
                //enhance hex data
                hexIDList = lineup.hexbuff.recomm.split(",")
                lineup.hexbuff.recomm = []
                for(i in hexIDList){
                    hexID =hexIDList[i]
                    if(!(hexMap[hexID]==undefined)){
                        lineup.hexbuff.recomm.push(hexMap[hexID])
                    }

                }
            }
            console.log(lineupList)
        },
        showInfo(info){
            alert(info)
        }
    },
}).mount('#app')

