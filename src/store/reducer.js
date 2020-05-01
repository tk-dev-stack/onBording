import { EncryptDecryptSessionStorageService } from "../Utils/EncryptDecryptSessionStorageService";


const inital = {
  "userPermission": {},
  "orgPermission": {},
  "empPermission": {}
}

var nopermission = {
  isCreate: false, isView: false, isDelete: false, isEdit: false
}
function reducer(state = inital, action) {
  const role = EncryptDecryptSessionStorageService.getObjectSessionStorage('role');

  switch (action.type) {
    case 'setRole':
      {
        EncryptDecryptSessionStorageService.setObjectToSessionStorage('role', action.role);
        break;
      }
    case 'setPermission':
      {
        var rolePermission;
        if (role !== undefined) {
          if (role.rolePermissions.length!==0) {
            for (let i of role.rolePermissions) {
              for (let j of action.component) {
                if (i.componentId == j.componentId) {
                  i.name = j.name;
                  var tempUser; var tempOrganisation; var tempEmployee
                  if (i.name.includes("Organisation")) {
                    tempOrganisation = i;
                    if( tempOrganisation.isView==undefined){tempOrganisation.isView=false}
                    if(tempOrganisation.isCreate==undefined){tempOrganisation.isCreate=false}
                    if(tempOrganisation.isEdit==undefined){tempOrganisation.isEdit=false}
                    if(tempOrganisation.isDelete==undefined){tempOrganisation.isDelete=false}
                  }
                  if (i.name.includes("Users")) {
                    tempUser = i
                    if( tempUser.isView==undefined){tempUser.isView=false}
                    if(tempUser.isCreate==undefined){tempUser.isCreate=false}
                    if(tempUser.isEdit==undefined){tempUser.isEdit=false}
                    if(tempUser.isDelete==undefined){tempUser.isDelete=false}
                  }
                  if (i.name.includes("Employee")) {
                    tempEmployee = i;
                    if( tempEmployee.isView==undefined){tempEmployee.isView=false}
                    if(tempEmployee.isCreate==undefined){tempEmployee.isCreate=false}
                    if(tempEmployee.isEdit==undefined){tempEmployee.isEdit=false}
                    if(tempEmployee.isDelete==undefined){tempEmployee.isDelete=false}
                  }
                  rolePermission = {
                    "userPermission": tempUser !== undefined ? tempUser : nopermission,
                    "orgPermission": tempOrganisation !== undefined ? tempOrganisation : nopermission,
                    "empPermission": tempEmployee !== undefined ? tempEmployee : nopermission
                  }
                }
              }
            }
          }
          else{
            var rolePermission;
            rolePermission = {
              "userPermission": nopermission,
              "orgPermission": nopermission,
              "empPermission": nopermission
            }
            }
        }
        return rolePermission
      }
    default:
      return state;
  }

}

export default reducer;


