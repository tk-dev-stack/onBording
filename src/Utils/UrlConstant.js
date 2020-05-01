export default class UrlConstant {

    static verifyEmailUrl = '/user/loginEmail?email='
    static loginUrl = '/user/login'
    static signupUrl = '/user/signup';

    static forgotPasswordUrl = '/user/forgotPassword?';
    static tokenverifyUrl = '/user/validateToken?token='
    static resetPasswordUrl = '/user/resetPassword'
    static logout = '/user/logout';

    static statusList = '/master/status/listByCategory';

    static employeeDList = '/employee/employeeDList';
    static employeeById = '/employee/detail';
    static saveEmployeeSalary = '/employee/salary/save?employeeId=';
    static getEmployeeSalaryById = '/employee/salary/getByEmployeeId?employeeId=';


    static employeeDocumentList = '/employee/document/list';
    static employeeDocumentListById = '/employee/document/listByEmployeeId'
    static startDeprovision = '/employee/startDeprovision';

    static componentsList = '/role/components';
    static deleteDocumentDetail = '/employee//documentDetail/delete';
    static departmentDList = '/master/departmentDList';
    static designationDList = '/master/designationDList';
    static getUserById = '/user/params';
    static getDepartmentList = '/master/allActiveDepartments'
    static getDepartmentsList = '/master/department/listByRange'
    static getDesignationList = '/master/allDesignationByDepartment?'
    static searchEmpByParms = '/employee/employeeListFilter?'

    static getRoleComponents = '/role/components'
    static getEmpDList = '/employee/employeeDList?organisationId='
    static getRoleDList = '/role/RoleDList?organisationId='
    static employeecatagoryDL = '/employee/engagementCategory/DList';
    //save api's
    static addRole = '/role/save'
    static addUser = '/user/save'
    static addDepartment = '/master/department/save'
    static getEmpDList = '/employee/employeeDList?organisationId='
    static getRoleDList = '/role/RoleDList?organisationId='

    //Designation
    static saveDesignation = '/master/designation/save'
    static getDesignationListByRange = '/master/designation/listByRange'
    static deleteDesignation = '/master/designation/delete'

    static deleteRole = '/role/delete'
    static deleteUser = '/user/delete'
    static deleteAsset = '/employee/asset/delete'
    static deleteDepartment = '/master/department/delete';
    static deleteEngagement = '/employee/engagement/delete'
    static deleteDocument = '/employee/document/delete'


    static saveDocument = '/employee/document/save';
    static updateDocument = '/employee/document/update'
    static saveDocumentDetail = '/employee/document/save/detail';
    static downloadDocumentUrl = '/employee/documentDetail/download';
    static saveEmployee = '/employee/save';
    static checkMailExist = '/employee/OfficialMailCheck';
    static saveAsset = '/employee/asset/save';
    static empbulkUpload = '/employee/csvUpload?'

    static saveEngagement = '/employee/engagement/save';


    //list by range api's
    static departmentListbyRange = '/master/department/listByRange';
    static employeeList = '/employee/listByRange';
    static employeeAssestList = '/employee/asset/listByRange'
    static engagementListByRange = '/employee/engagement/listByRange';
    static getUserList = '/user/listByRange';
    static getRoleList = '/role/listByRange';


    static getAssetList = '/employee/asset/listByRange?'
    static getAssetDList = '/employee/assetCategory/DList?'
    static getDeprovisionAssetList = '/employee/asset/listByRange?'
    static generateExpLetter = '/employee/previewExperienceLetter?employeeId='
    static generateReleavingLetter = '/employee/previewRelievingLetter?employeeId='
    static downloadRelLetter = '/employee/downloadRelievingLetter?'
    static downloadExpLetter = '/employee/downloadExperienceLetter?'
    static getOrgById = '/master/organisation/get?'
    static saveOrganisation = '/master/organisation/save'
    static getAssetStatusList = '/master/status/listByCategory?statusCategory=Asset'
    static saveAssetCategory = '/employee/assetCategory/save'
    static saveEngagementCategory = '/employee/engagementCategory/save'
    static startProvision = '/employee/startProvision?';
    static autoUploadDocument = '/employee/autoDocumentUpload?employeeId=';
    static documentPreviewUrl = '/employee/documentDetail/getByDocumentDetailId?documentDetailId=';
    static getEmpByDepartmentId = '/employee/employeeByDept';

    static getDocumentTypeUrl = '/employee/documenttype/DList'


    static appointmentLetterCode = 'APPTLTR';
    static confidentalityLetterCode = 'CONFAGR';
    static offerLetterCode = 'OFRLTR'
    static experinceLetterCode = 'EXPLTR';
    static releivingLetterCode = 'RLVLTR';



}
//sessionStorage names:
//token
//userId
//isAuthorized
//orgId
//profileurl
