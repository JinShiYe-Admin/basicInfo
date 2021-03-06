import './student_card.css';
import React, {Component} from 'react';
import store from '../../../utils/store';
import storekeyname from '../../../utils/storeKeyName';
import myUtils from '../../../utils/myUtils';
import {Table, Button, Form, Input, Select, message, Col, Row,} from 'antd';
import {withRouter} from 'react-router-dom';
import {getColumns} from "../../../utils/commom-colums";
import Container from "../../../common_from_baseframe/Container";
import Header from "../../../common_from_baseframe/Header";
import {ContentDark} from "../../../common_from_baseframe/Content";

class AdvancedSearchForm extends React.Component {
        constructor(props){
            super(props)
            this.state={
                clss:[],//班级数组
            }
        }

    handleSearch = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            this.props.changeSearchData(values);
        });
    };

    handleReset = () => {
        this.props.form.resetFields();
    };

    handleChange=(value)=> {
        // console.log(`selected ${value}`);
        let grdCls=this.props.grdClsData;
        this.setState({
            clss:[],
        })
        console.log(grdCls)
        grdCls.map(item=>{
            if(value===item.grd_code){
                let clss=item.child;
                this.setState({
                    clss,
                })
            }
        })
        this.props.form.resetFields("cls_id");
    }


    render() {

        const { getFieldDecorator } = this.props.form;
        const { Option } = Select;
        let options=[];
        let cardType=this.props.cardType;
        cardType.map(item=>{
            let option=<Option key={item.code} value={item.code}>{item.name}</Option>;
            options.push(option)
        })

        let grds=this.props.grdClsData===undefined?[]:this.props.grdClsData;
        let grdOptions=[];
        if(grds!==undefined){
            let qboption=<Option key={0} value={0}>全部年级</Option>;
            grdOptions.push(qboption);
            grds.map(item=>{
                let option=<Option key={item.grd_code} value={item.grd_code}>{item.grd_name}</Option>;
                grdOptions.push(option)
            })
        }
        let clss=this.state.clss;
        let clsOptions=[];
        let clsoption=<Option key={0} value={0}>全部班级</Option>;
        clsOptions.push(clsoption);
        clss.map(item=>{
            let option=<Option key={item.cls_code} value={item.cls_code}>{item.cls_name}</Option>;
            clsOptions.push(option)
        })
        let addBtn=null;
        if(this.props.editPermission){
            addBtn=<Button type="primary" style={{ marginLeft: 8 }} onClick={this.props.onSubmitRecordPL}>批量保存</Button>
        }
        return (
            <div className='common-search-form'>
                <Form layout="inline" onSubmit={this.handleSearch}>
                    <Form.Item label={"年级"} >
                        {getFieldDecorator("grd_id", {
                            initialValue:0
                        })(
                            <Select onChange={this.handleChange}>
                                {grdOptions}
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item label={"班级"} >
                        {getFieldDecorator("cls_id", {
                            initialValue:0,
                        })(
                            <Select>
                                {clsOptions}
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item label={"学生姓名"} >
                        {getFieldDecorator("uname", {
                        })(<Input placeholder="请输入学生姓名" />)}
                    </Form.Item>
                    <Form.Item label={"卡地址"} >
                        {getFieldDecorator("cardId", {
                        })(<Input placeholder="请输入卡地址" />)}
                    </Form.Item>
                    <Form.Item label={"是否有卡"} >
                        {getFieldDecorator("haveCard", {
                            initialValue:-1,
                        })(
                            <Select>
                                <Option value={-1}>全部</Option>
                                <Option value={1}>有</Option>
                                <Option value={0}>无</Option>
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item label={"卡类型"} >
                        {getFieldDecorator("cardType", {
                            initialValue:this.props.cardType.length>0?this.props.cardType[0].code:"",
                        })(
                            <Select>
                                {options}
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item>
                        {addBtn}
                        <Button type="primary" htmlType="submit" style={{ marginLeft: 8 }}>
                            查找
                        </Button>
                        <Button  onClick={this.handleReset} style={{ marginLeft: 8 }}>
                            重置
                        </Button>
                     </Form.Item>
                </Form>
            </div>
        );
    }
}
const WrappedAdvancedSearchForm = Form.create({ name: 'advanced_search' })(AdvancedSearchForm);



class StudentCard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [],//列表数据
            cardType:[],//卡类型
            grdAndCls:[],//年级数组
            searchData:{
                cardid:"",//卡id
                uname:"",//用户姓名
                cardtp:0,//卡类型
                iscard:-1,//是否有卡
                grd_id:0,//年级ID
                cls_id:0,//班级ID
            },//搜索框数据
            add_edit:false,//增加 修改 权限
            loading:true,//正在加载中
            pagesize:10,//每页显示条数
            pageindex:1,//默认当前页
            total:0,//数据总数
        }
    }
    //获取卡类型
    getCardType=(callback)=>{
        let utoken =store.get(storekeyname.TOKEN);
        let personal=store.get(storekeyname.PERSONALINFO);
        let paramsUserInfo = {
            platform_code:personal.platform_code,
            app_code:personal.app_code,
            access_token: utoken,
            isimg:0
        };
        myUtils.post(storekeyname.INTERFACEGU+"SysMcType", paramsUserInfo, res => {
            console.log(JSON.stringify(res))
            if (res.code == 0) {
                let cardType = res.data.list;
                let searchData=this.state.searchData;
                let cardtp=cardType[0].code;
                searchData.cardtp=cardtp;
                this.setState({
                    cardType,
                    searchData
                })
                callback();
            }else{
                message.error(res.msg)
            }
        });
    }

    //查找模块点击事件
    changeSearchData=data=>{
        console.log(data)
        let searchData={}
        searchData.cardid=data.cardId||""//卡id
        searchData.uname=data.uname||""//用户姓名
        searchData.cardtp=data.cardType//卡类型
        searchData.iscard=data.haveCard//是否有卡
        searchData.grd_id=data.grd_id//年级ID
        searchData.cls_id=data.cls_id//班级ID
        this.getTableData(searchData,1);
    }

    //获取默认表格数据
    getTableData=(searchData,page)=>{
        let utoken =store.get(storekeyname.TOKEN);
        let personal=store.get(storekeyname.PERSONALINFO);

        this.setState({
            data:[],
            searchData,
            pageindex:page,//默认当前页
            loading:true,
            total:0,//数据总数
        })

        let paramsUserInfo = {
            platform_code:personal.platform_code,
            app_code:personal.app_code,
            access_token: utoken,
            pagesize:this.state.pagesize,
            pageindex:page,

            cardid:searchData.cardid,
            uname:searchData.uname,
            cardtp:parseInt(searchData.cardtp),
            iscard:searchData.iscard,
            grade_id:searchData.grd_id,
            cls_id:searchData.cls_id,

            school_id:personal.unit_code,
        };
        myUtils.post(storekeyname.INTERFACEGU+"HrStuCardP", paramsUserInfo, res => {
            console.log(res)
            if (res.code == 0) {
                let data=[];
                if(res.data!==null){
                    let datas =res.data.list;
                    datas.map((item,index)=>{
                        item.xh=index+1;
                        item.showBtn=false;//是否显示提交btn
                        item.showError=false;//是否显示错误提醒
                        item.newCardId=item.cardid;
                        item.cardtp=this.state.searchData.cardtp
                        item.msg="";
                        data.push(item)
                    });
                    this.setState(Object.assign({}, this.state, {
                        data,
                        loading:false,
                        total:res.data.pagerowc
                    }))
                }else{
                    this.setState(Object.assign({}, this.state, {
                        data,
                        loading:false,
                        total:0
                    }))
                }
            }else{
                message.error(res.msg)
            }
        });
    }

    //获取学校年级班级数据
    getGrdCls=(callback)=>{
        let utoken =store.get(storekeyname.TOKEN);
        let paramsUserInfo = {
            is_finish:0,
            access_token: utoken,
        };
        myUtils.post(storekeyname.INTERFACEMENG +"api/grd", paramsUserInfo, res => {
            console.log("api/grd/list:"+JSON.stringify(res));
            if (res.code == 0) {
                let grds = res.data.list;
                let grdids=[];
                grds.map(item=>{
                    grdids.push(item.grd_code)
                })
                if(grds && grds.length>0){
                    let paramsUserInfo = {
                        is_finish:0,
                        grd_codes: grdids.join(","),
                        access_token: utoken,
                    };
                    myUtils.post(storekeyname.INTERFACEMENG +"api/cls", paramsUserInfo, res2 => {
                        console.log("api/cls/list:"+JSON.stringify(res2))
                        if (res.code == 0) {
                            let clss=res2.data.list;
                            grds.map(item2=>{
                                let child=[];
                                let pgrdid=item2.grd_code;
                                clss.map(itemChild=>{
                                    let grdid=itemChild.grd_code;
                                    if(pgrdid===grdid){
                                        child.push(itemChild)
                                    }
                                })
                                item2.child=child;
                            })
                            console.log(JSON.stringify(grds))
                            this.setState({
                                grdAndCls:grds
                            })
                            // console.log(JSON.stringify(grds));
                            callback();
                        }else{
                            message.error(res.msg)
                        }
                    });
                }
            }else{
                message.error(res.msg)
            }
        });
    }

    //获取权限
    getPermission=(callback)=>{
        //1.9: 查询权限符（前端调用，判断按钮是否显示）
        let utoken =store.get(storekeyname.TOKEN);
        let personal=store.get(storekeyname.PERSONALINFO);
        let permissions = [
            storekeyname.card_add,
        ]
        let access = [];
        permissions.map(item => {
            access.push(personal.app_code + item)
        });
        let paramsPermissions = {
            platform_code: personal.platform_code, //平台代码
            app_code: personal.app_code, //应用系统代码
            grd_code: 0, //年级id，全部年级则传-1,不需要判断年级则传0
            cls_code: 0, //班级id，年级下全部班级则传-1，不需要判断班级则传0
            stu_code: 0, //学生id，全部学生则传-1，不需要判断学生则传0
            sub_code: 0, //科目代码，全部科目则传“-1”，不需要判断年级则传“0”
            access: access.join(","), //权限符，需要判断权限的权限符，多个则用逗号拼接
            access_token: utoken //用户令牌
        };
        myUtils.post(storekeyname.INTERFACEZENG+"api/acl/permissionByPosition", paramsPermissions, res => {
            console.log(JSON.stringify(res))
            if (res.code == 0) {
                let rspList = res.data.result.split(",");
                let permissionsObj = new Map();
                rspList.map((item, index) => {
                    if (item == 1) {
                        permissionsObj.set(permissions[index], true);
                    } else {
                        permissionsObj.set(permissions[index], false);
                    }
                });
                this.setState({
                    add_edit:permissionsObj.get(storekeyname.card_add),
                })
                callback();
            } else {
                message.error(res.msg)
            }
        });
    }

    //行数据编辑事件
    onchange=(e,rowdata)=>{
        // console.log(e.target.value)
        // console.log(cardid)
        // console.log(rowdata)
        let value=e.target.value;
        let data =this.state.data;
        let uid=rowdata.uid;
        let newData=[];
        let reg="^[A-Za-z0-9-_]+$";
        let regus = new RegExp(reg);
        let isError=regus.test(value);
        let showBtn=false;
        let showError=false;
        let msg="";
        if(!isError&&value.length>0){
            showBtn=false;
            showError=true;
            msg="只允许输入数字或字母"
        }else{
            showError=false;
            if(value.length>0 && value.length<8){
                showBtn=false;
                showError=true;
                msg="卡地址不能小于8位"
            }else{
                showBtn=true;
                showError=false;
                msg=""
            }
        }
        data.map(item=>{
            if(item.uid===uid){
                item.newCardId=value;
                if(item.cardid===value){
                    item.showBtn=false;
                    item.showError=false;
                    item.msg=msg;
                }else if(value.length===0&&item.cardid!==value){
                    item.showBtn=true;
                    item.showError=false;
                    item.msg=msg;
                }else{
                    item.showBtn=showBtn;
                    item.showError=showError;
                    item.msg=msg;
                }
            }
            newData.push(item)
        })
        // console.log(newData)
        this.setState({
            data:newData
        })
    }

    //提交行修改的数据
    onSubmitRecord=(rowdata,type)=>{
        // console.log(rowdata)
        let utoken =store.get(storekeyname.TOKEN);
        let personal=store.get(storekeyname.PERSONALINFO);
        let paramsUserInfo = {
            platform_code:personal.platform_code,
            app_code:personal.app_code,
            access_token: utoken,
            rid:rowdata.rid,
            uid:rowdata.uid,
            cardid:rowdata.newCardId,
            uname:rowdata.uname,
            cardtp:parseInt(this.state.searchData.cardtp),
            school_id:personal.unit_code,
        };
        console.log(paramsUserInfo)
        myUtils.post(storekeyname.INTERFACEGU+"HrStuCardAorE", paramsUserInfo, res => {
            console.log(res)
            if (res.code == 0) {
                if(type==="PL"){
                    this.getTableData(this.state.searchData,this.state.pageindex);
                }else if(type==="DG"){
                    let data =this.state.data;
                    let cardid=rowdata.cardid;
                    data.map(item=>{
                        if(cardid===item.cardid){
                            item.showBtn=false;//是否显示提交btn
                            item.showError=false;//是否显示错误提醒
                            item.newCardId=rowdata.newCardId;
                            item.cardid=rowdata.newCardId;
                            item.msg="";
                        }
                    })
                    this.setState({
                        data
                    })
                }
                message.success("修改成功！")
            }else{
                message.error(res.msg)
            }
        });
    }
    //批量提交行修改的数据
    onSubmitRecordPL=()=>{
        console.log(this.state.data)
        let data =this.state.data;
        let cardids=new Map();
        let cardidsList=[];
        data.map(item=>{
            if(item.showBtn){
                cardidsList.push(item.newCardId)
                cardids.set(item.newCardId,"666");
            }
        })
        if(cardids.size===cardidsList.length){
            data.map(item=>{
                if(item.showBtn){
                    this.onSubmitRecord(item,"PL")
                }
            })
        }else{
            message.error("卡地址重复，请检查卡地址！")
        }
    }

    componentDidMount() {
        // this.getPersonalInfo(()=>{
        //     // this.getCardType(()=>{
        //     //     this.getGrdCls(()=>{
        //     //         this.getPermission(()=>{
        //     //             this.getTableData();
        //     //         })
        //     //     })
        //     // })
        //     this.getGrdCls(()=>{})
        //     this.getPermission(()=>{})
        //     this.getCardType(()=>{
        //         this.getTableData();
        //     })
        // })
            this.getGrdCls(()=>{})
            this.getPermission(()=>{})
            this.getCardType(()=>{
                this.getTableData(this.state.searchData,this.state.pageindex);
            })
    }

    render() {
        let columns= getColumns("stu_card",this)
        return (
            <Container>
                <Header refresh={true}/>
                <ContentDark>
            <div>
                <Row className={"search-box"}>
                    <Col span={24}>
                        <WrappedAdvancedSearchForm cardType={this.state.cardType} editPermission={this.state.add_edit} changeSearchData={this.changeSearchData} onSubmitRecordPL={this.onSubmitRecordPL} grdClsData={this.state.grdAndCls}/>
                    </Col>
                    <Col span={24}>
                        <Table className={"info-table"}
                               columns={columns}
                               dataSource={this.state.data}
                               bordered
                               size='middle'
                               rowKey={record=>record.uid}
                               loading={this.state.loading}
                               pagination={{
                                   current:this.state.pageindex,
                                   onChange: page => {
                                       let data=this.state.data;
                                       let canNext=true;
                                       data.map(item=>{
                                           if(item.showBtn){
                                               canNext=false;
                                           }
                                       })
                                       if(canNext){
                                           this.getTableData(this.state.searchData,page);
                                       }else{
                                           message.error("请先保存当前页面卡地址")
                                       }
                                   },
                                   pageSize: this.state.pagesize,
                                   hideOnSinglePage:true,
                                   total:this.state.total
                               }}
                        />
                    </Col>
                </Row>
            </div>
                </ContentDark>
            </Container>
        )
    }
}
const StudentCards = Form.create({ name: 'student_card' })(StudentCard);

let _StudentCards = withRouter(StudentCards)
export default _StudentCards;
