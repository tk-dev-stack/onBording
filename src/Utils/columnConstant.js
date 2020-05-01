export default class ColumnConstant {

  static roleListColumn = [

    {
      title: 'Role',
      dataIndex: 'name',


    },
    {
      title: 'Description',
      dataIndex: 'description',

    },
    {
      title: 'Action',
      dataIndex: 'action',


    },

  ]

  static userListcolumns = [
    {
      title: 'User Name',
      dataIndex: 'name',
    },
    {
      title: 'Role',
      dataIndex: 'role.name',
    },
    {
      title: 'Email Address',
      dataIndex: 'email',
    },
    {
      title: 'Action',
      dataIndex: 'action',
    },
  ];
  static assestColumn = [
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
    },
    {
      title: 'Assigned Date',
      dataIndex: 'assignedDate',
    },
    {
      title: 'Status',
      dataIndex: 'provisionStatus.name',
    },
    {
      title: 'Provisioned by',
      dataIndex: 'department.name',
    },
    {
      title: 'Action',
      dataIndex: 'action',
    }
  ]

  static engagementColumn = [
    {
      title: 'Program Name',
      dataIndex: 'name',
      onFilter: (value, record) => record.name.indexOf(value) === 0,
      sorter: (a, b) => a.name.length - b.name.length,
      sortDirections: ['descend'],
    },
    {
      title: 'Description',
      dataIndex: 'description',
    },
    {
      title: 'Assign Date',
      dataIndex: 'startDate'
    },

    {
      title: 'Status',
      dataIndex: 'status.name',
      onFilter: (value, record) => record.status.name.indexOf(value) === 0,
      sorter: (a, b) => a.status.name.length - b.status.name.length,
      sortDirections: ['descend'],
    }, {
      title: 'Action',
      dataIndex: 'action',
    }]
  static departmentColumns = [
    {
      title: 'Departments',
      dataIndex: 'name',

    },
    {
      title: 'Email ID',
      dataIndex: 'leadEmail',

    },
    {
      title: 'Description',
      dataIndex: 'description',

    },
    {
      title: 'Action',
      dataIndex: 'action'

    },
  ];


  static designationColumns = [
    {
      title: 'Designation',
      dataIndex: 'name',
    
    },
    {
      title: 'Department',
      dataIndex: 'department.name',
    },
      
    {
      title: 'Description',
      dataIndex: 'description',
    },

    {
      title: 'Action',
      dataIndex: 'action'
  
    },
  ];

}

