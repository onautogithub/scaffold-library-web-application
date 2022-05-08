Version 1.2.1.
https://scaffoldhub.io

From the author: This code can only be used for academic and learning purposes.

**Please read my notes below before you start working on this tutorial.**

Things to know:
- The following are my rough notes after watching Scaffold's for many hours (at least couple of weeks) YouTube tutorial. I was simply following his instructions and I did not have enough time to full grasp everything he did. That's why I decided to create these notes. His video can be found here: https://www.youtube.com/watch?v=FdC4Mjljd3k&t=216s


My README notes outlines the pre-work setup you have to do before you start with his tutorial. It highlights the pitfalls I encountered along with their solutions. The notes documents the customizations steps from the tutorial.

- I am using vue version 2.9.6 for this tutorial.
- I followed the tutorial to customize mysql only.
- The tutorial calls for node 8 but I am using node 16.15.0. See my notes below on why it is the case.
- The first USER you create for this tutorial becomes the admin User
- To start the frontend, cd frontend. Enter npm start.
- To start the backend-sql, cd backend-sql. Enter npm start.
- When you start the application using the code from the author's github, and when you make an attempt to perform a search, you will get an error 500.
See my notes below on how to fix this issue.

**It is recommended that you use a Node Version Manager tool:** to switch between node versions. I will explain why in my notes below.
The tool is called **nvm** and can be found here: https://github.com/coreybutler/nvm-windows

** Few useful commands:
- nvm list
- nvm install <version>. 

I installed 2 node versions, the latest and version 8

> nvm install 16.15.0
> nvm install 8.17.0

To swap between versions, perform the following command (you might have to open a cmd window with admin rights)

- nvm use <version> (e.g. nvm use 16.15.0 or nvm use 8.17.0 )

**Couple of Notes:***
The recommended version for node for this tutorial is **node 8** . However, I was unable to use the **VSCode debugger** using node 8.
As I previously mentioned, I ended up installing 16.15.0 and version 8.17.0. I used nvm to flip between the versions. 

I ran into issues when I upgraded to the latest version of node. However, I was able to rectify them. See my notes below on how to rectify using node version 16.15.0

**1)** You must install the cross-env package before you start working on the server side. 
Since the tutorial calls for **node 8** , we must install cross-env@6. 

(see notes here: https://www.npmjs.com/package/cross-env). 

Here's the command to install cross-env@6:

> npm install --save-dev cross-env@6

**Side note:** cross-env@6 works with version 8 and 16.15.0. Even though I upgraded node to version 16.15.0, I installed cross-env@6 for compatibility reason to provide me the flexiblility to revert back to node 8 without any issues.

**2)**  The "bcrypt": "3.0.6", a dependency for this project, is not compatible with node 16.15.0. I had to upgrade bcrypt to version 5.0.1.
I also upgraded other packages which I listed below.

*** IMPORTANT: Issues to be aware of along with the fix:**

****ISSUE 1: SEQUELIZE PASSING THE LIMITS AND OFFSET AS STRING INSTEAD OF INTEGER****

> ***SYMPTOM:*** 
When you first start the application without any customization, you will immediately get an error 500 when you try to get list of users, loans, books, etc.

***CAUSE:***
Sequelize is passing the pagination Limits and Offset parameters as Strings instead of Integers

***SOLUTION:***
> To resolve the issue, replace the following entries in the various files. 
(e.g: bookRepository.js, auditLogRepository.js, userRepository.js, loanRepository.js)

     limit: limit || undefined, to => limit: parseInt(limit) ? parseInt(limit) : undefined,
     offset: offset || undefined, to =>  offset: parseInt(offset) ? parseInt(offset) : undefined,

***SIDE NOTE:**
I upgraded the following packages:

From: "sequelize": "4.42.1" to sequelize": "^6.19.0"
From: "mysql2": "1.6.5" to mysql2": "2.3.3"
From "element-ui": "2.5.4" to "element-ui": "2.15.8"
Form "bcrypt": "3.0.6" to "bcrypt": "^5.0.1"

I upgraded Sequellize and mysql2 to the latest version in the hope to resolve the issue but the upgrade did not resolve it. However, it caused other issues which I resolved. I decided to stay on the latest versions listed above anyway. 

**YOU DON'T HAVE TO UPGRAGE these packages.***

I performed the following steps resolve these new issues:

**a)** Import issue in the index file src->database->models->index.js at line 25.

Action to take: Comment out the statement and replace it with the uncommented one.
  .forEach(function(file) {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
    // const model = sequelize['import'](
    //   path.join(__dirname, file),
    // );
    db[model.name] = model;
  });

  **b)** operatorsAliases is Sequelize version 5 and above is not longer required.
Action to take, comment out the operatorsAliases: false parameter in the backend-sql->config->localhost.js file
    database: {
    username: 'root',
    dialect: 'mysql',
    password: 'root',
    database: 'library-dev-db',
    host: 'localhost',
    logging: console.log,
    // operatorsAliases: false
  },

****************End of ISSUE 1**  ****************************************

****ISSUE 2:You cannot checkout a book using the New Loan form. There is an issue with the initial code when searching for Book.***

> ***SYMPTOM:*** 
Loan menu -> New Loan
Enter the Book name, you will get no data found. The field automatically fetches the ISBM number instead.
That' not the right behavior. You should be able to enter/search on the book title not its ISBN.

***CAUSE:***
  The async findAllAutocomplete(query, limit) sequelize sql statement in backend-sql->src->database->repositories->**bookRepository.js** is  returning the ISBN instead of the book title. 

***SOLUTION:***
Here's how to fix it:
    
async findAllAutocomplete(query, limit) {
    
    const filter = new SequelizeAutocompleteFilter(
      models.Sequelize,
    );

    if (query) {
      filter.appendId('id', query);
      // filter.appendIlike('isbn', query, 'book');
      filter.appendIlike('title', query, 'book');
    }

    const records = await models.book.findAll({
      attributes: ['id', 'title'],
      where: filter.getWhere(),
      limit: parseInt(limit) ? parseInt(limit) : undefined,
      // limit: limit || undefined,
      // orderBy: [['isbn', 'ASC']],
      orderBy: ['title', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      // label: record.isbn,
      label: record.title
    }));
  }


***********************************************************End of ISSUE 2**  ****************************************


*** Now with the rest of the tutorial --- Customization**

**Important Note:** Remember, the first user you create when you login to the application will inherit the admin priveleages. 
This is defined as **isFirstUser** in the **backend\srs\services\auth\authService.js** file.


*************************************************************************************************
*********************1st Customization: *** Modify the localhost config file ***
*************************************************************************************************

Modify the parameters in the backend-sql->config->localhost.js file to reflect your database configurations:
and generate the authJwtSecret value. You can use an external software on the web to generate these random values.
  database: parameter
  email: 
  clientUrl: 'http://localhost8081'
  authJwtSecret: 'a40a8850-24b2-4023-85ce-1765d10c849b-758df0c2-b112-4851-960d-1b7163d3ccd6',

  *** Optional the FRONTEND localhost config file ***
  I made the change to run the backend server at port 5000
  
  frontend->src->config->localhost.js
  const backendUrl = `http://localhost:5000/api`;

*************************************************************************************************
*********************Next Customization: *** Modify i18n: en.js ***
*************************************************************************************************

-- Change app title from Application to Library  (for both backend and frontend)

On the frontend:
adjust spaces (e.g. 
inprogress to in progress
numberofcopies to number of copies
)

Under iam: {
  change title: from Identity and Access Management to Users
  change menu: from iam to Users

}
Save the file.

*************************************************************************************************
*********************Next Customization: *** Replace the signin and sign up side image** 
*************************************************************************************************

Under the public directory (frontend->public), replace the signin.jpg and singup.jpg with your images using the same names.

*************************************************************************************************
*********************Next Customization: Add Icons to the menu. User font-awesome 4.7.9** 
*************************************************************************************************

P.S. The font-awesome is already installed. I just need to get the icons I need as shown below
From font-awesome website, select address-card-o and book

Menu items location:
front-end->src->modules->layout->components->menu.vue
scoll down and replace to find the '/loan' and '/book'
<el-menu-item
        :class="classFor('/loan')" 
        class="el-icon-fa-chevron-right">
        <i class="el-icon-fa-chevron-right"></i> with  <i class="el-icon-fa-address-card-o"></i>

and 
<el-menu-item
        :class="classFor('/book')"
        :route="{ path: '/book' }"
        index="/book"
        v-if="hasPermissionToBook"
      >
        <i class="el-icon-fa-chevron-right"></i> with <i class="el-icon-fa-book"></i>

*************************************************************************************************
*********************Next Customization: Re-arrange the side menu**
*************************************************************************************************

Place the Users menu item above the Loan menu item. 
(remember we changed the iam title from Identity and Access Management to Users.
So Users menu handler is called iam, so look for iam menu item
In the same file above, scroll to locate the following:
      <el-menu-item
        :class="classFor('/iam')"
        :route="{ path: '/iam' }"
        index="/iam"
        v-if="hasPermissionToIam"
      >
        <i class="el-icon-fa-user-plus"></i>
        <span slot="title">
          <app-i18n code="iam.menu"></app-i18n>
        </span>
      </el-menu-item>

  > cut and paste this menu item above '/loan'
  
  **Save the file**

*************************************************************************************************
*********************Next Customization: Modify the Librarian and Member roles***
*************************************************************************************************

In this tutorial we will only define 2 roles: "librarian" and "member".  
  
  > Modify / limit of the default number of roles. The security is set on both the frontend and backend.

**IMPORTANT NOTE: THE SECURITY, ROLES, PERMISSION ARE IMPLEMENTED ON BOTH THE FRONTEND AND BACKEND. YOU MUST MODIFY BOTH.
*** OTHERWISE, YOU WILL GET THE ERROR **403 SORRY, YOU DON'T HAVE ACCESS TO THIS PAGE.**

  a) Let's start with the frontend:

  **Step A - Setup the roles**
    > Edit frontend->src->security->roles.js
  i) Locate the following and delete all the roles with the exception of owner and editor.

  static get values() {
    return {
      owner: 'owner',
      editor: 'editor',

  ii) Delete the rest of the roles.

  iii) Rename:
  owner to librarian
  editor to member

Therefore the end result looks like this:

  class Roles {
  static get values() {
    return {
      librarian: 'librarian',
      member: 'member'
    };
  }
  
  > SAVE the file

 **Step B - Setup the permissions for the 'owner' and 'member'**

 * The librarian has access to the User Management tasks. 
 * The member does not. The only permissions the member has access to are:
 
 loadRead
 bookRead
 bookAutocomplete

 Let's setup the permission.

  > Edit frontend->src->security->permissions.js
  i) Delete all roles in the file except the owner 
  (e.g.)
          allowedRoles: [
          roles.owner
        ],

ii) Rename owner to librarian:
(e.g.)
    return {
      iamEdit: {
        id: 'iamEdit',
        allowedRoles: [
          roles.librarian
        ],
        allowedStorageFolders: ['user'],
      },

iii) As mentioned. The permissions the member has access to are:
 loadRead
 bookRead
 bookAutocomplete

So, let's add their role accordingly by searching each label and adding the role.
(e.g.)
      loanRead: {
        id: 'loanRead',
        allowedRoles: [
          roles.librarian,
          roles.member
        ],
      },
      
** Note: Other files have files have the roles defined. We need to edit/delete these roles accordingly.

iv) Search the frontend for **owner** to locate all the files:
Our search identified several files:

1- **en.js** has all the old roles defined.

Let modify the **en.js** file: 
Only the owner has the admmistrative privelidges to edit this file. Let's fix it accordingly:

* The first section that we located in this file was under roles: {

> Under the section Roles, comment out all the roles with the exception of owner and editor.
  roles: {
    owner: {
      label: 'Owner',
      description: 'Full access to all resources',
    },
    editor: {
      label: 'Editor',
      description: 'Member access to all resources',
    }, 

> Since we renamed the rolers earlier to librarian and member, 
Rename owner to librarian (role is librarian, label is Librarian) 
Rename editor to member (role is member, label is Member) 

  roles: {
    owner: {
      label: 'Owner',
      description: 'Full access to all resources',
    },
    member: {
      label: 'Member',
      description: 'Edit access to all resources',
    },

* The second section that we located in this file was under:

  iam: {
    :
    :
    :
    errors: {
      userAlreadyExists:
        'User with this email already exists',
      userNotFound: 'User not found',
      disablingHimself: `You can't disable yourself`,
      revokingOwnPermission: `You can't revoke your own owner permission`,
    },
  },

  > Replace `You can't revoke your own owner permission` with `You can't revoke your own librarian permission`


*** Now to the same for the Portuges , pt-BR.js file (see video)

**IMPORTANT NOTE: THE SECURITY, ROLES, PERMISSION ARE IMPLEMENTED ON BOTH THE FRONTEND AND BACKEND. YOU MUST MODIFY BOTH.
*** OTHERWISE, YOU WILL GET THE ERROR **403 SORRY, YOU DON'T HAVE ACCESS TO THIS PAGE.**

  a) Let's setup the backend:

  **Note:**
  -- The backend has also the permissions.js and roles.js
  -- The en.js needs to be modified as well
  -- The backend server has additional permissions checks that needs to be modified as well.

  Steps:
  
  > Search for **owner** to identify the files that needs to be modified:

  I) let's modify the permission.js file

> let's copy and paste to replace the whole ONLY the permission class in the permission.js file from the frontend to the backend.

**1st file to modify: permission.js**

class Permissions {
  static get values() {
    return {
      iamEdit: {

**2nd file to modify: roles.js**
  II) Let's modify the roles.js file
  Let's copy the modified roles from the frontend to the backend. 
  Search for the following and just copy and paste the return {} section
  class Roles {
  static get values() {

    return {
      librarian: 'librarian',
      member: 'member'
    };

  }

  > Let's modify the en.js

    iam: {
    errors: {
      userAlreadyExists:
        'User with this email already exists',
      userNotFound: 'User not found',
      disablingHimself: `You can't disable yourself`,
      revokingOwnPermission: `You can't revoke your own owner permission`,
    },
  },

  > Replace `You can't revoke your own owner permission` with `You can't revoke your own librarian permission`

**3rd file to modify: backend\srs\services\auth\authService.js**
    ** As previously noted, the first user you create when you login to the application has all the admin priveleages. It is defined here:
    const isFirstUser =
      (await UserRepository.count()) === 0;

    const newUser = await UserRepository.createFromAuth({
      firstName: email.split('@')[0],
      password: hashedPassword,
      email: email,
      roles: isFirstUser ? [Roles.values.owner] : [],
    });

    ** Let's modify the **backend\srs\services\auth\authService.js** file:
    Locate the following and change [Roles.values.owner] to [Roles.values.librarian]
      
    From:
      const newUser = await UserRepository.createFromAuth({
      firstName: email.split('@')[0],
      password: hashedPassword,
      email: email,
      roles: isFirstUser ? [Roles.values.owner] : [],
    });

    To:
      const newUser = await UserRepository.createFromAuth({
      firstName: email.split('@')[0],
      password: hashedPassword,
      email: email,
      roles: isFirstUser ? [Roles.values.librarian] : [],
    });

  **NOTE:** the [] in roles: isFirstUser ? [Roles.values.librarian] : [], means first time registered uses will be the admin, which is in our case
  the librarian. Any subsequent users will not be automatically assinged a role when they register, thus the [], which means the admin (librarian) will assign subsequent users their roles.

  **4th file to modify: backend\srs\services\iam\iamEditor.js**
  
  > We cannot remove the admin role, which in our case is the librarian. Otherwise, no one can access the system.
  
  Locate the following and replace 
  
  -- this._roles.includes(Roles.values.owner with this._roles.includes(Roles.values.librarian

and

  -- async _isRemovingOwnOwnerRole() with  async _isRemovingOwnLibrarianRole()

and

return currentUserRoles.includes(Roles.values.owner); with return currentUserRoles.includes(Roles.values.librarian);
    
    This:
  async _isRemovingOwnOwnerRole() {
    if (this._roles.includes(Roles.values.owner)) {
      return false;
    }

    if (this.data.id !== this.currentUser.id) {
      return false;
    }

    const currentUserRoles = await UserRoleRepository.findAllByUser(
      this.currentUser.id,
    );

    return currentUserRoles.includes(Roles.values.owner);
  }

  **becomes this:**

  async _isRemovingOwnLibrarianRole() {
    if (this._roles.includes(Roles.values.librarian)) {
      return false;
    }

    if (this.data.id !== this.currentUser.id) {
      return false;
    }

    const currentUserRoles = await UserRoleRepository.findAllByUser(
      this.currentUser.id,
    );

    return currentUserRoles.includes(Roles.values.librarian);
  }

and in the  async _validate() function, change the following:

from if (await this._isRemovingOwnOwnerRole()) 

to 

if (await this._isRemovingOwnLibrarianRole())

 **5th file to modify: backend\srs\services\iam\iamRemover.js** 

 ** Note: Search for Owner and for _isRemovingOwnOwnerRole across all the files to make sure
 you got them all.

**Next:** 
Let's change the first user role in the database to librarian.
Why this step?  If you refresh your browser, the 403 error disapears. "Home" is the only menu item available to you.
When we first created the first time user, this user intiially inherited the "owner' role, which we changed to 'librarian".
The user along with his role is inserted in the database. We need to modify its role from "owner" to "librarian" in the database.
The role is defined in the **userroles** table
> replace the "owner" value in field role to "librarian".

*************************************************************************************************
*********************Next Customization: Home Page Redirection**
*************************************************************************************************

* We will be working on the route to the home page 
and
* fixing the menu to match our changes.

In our case, we want the user to be redirected to Loans once they login:

i) Let's work on modifying the route to make /loan the home page:

> Modify the section in the file frontend->src->app-module.js
> Add the following {path: '/', redirect: '/loan' } entry as the first entry to make the home page '/' to be '/loan'

const routes = [
  {path: '/', redirect: '/loan' },
  ...Object.keys(modules)
    .filter((key) => !!modules[key].routes)
    .map((key) => modules[key].routes)
    .reduce((a, b) => a.concat(b), []),
  { path: '*', redirect: '/404' },
];

ii) Let's work on modifying the menu to remove the home page:
**Now that we made the Loan page as our home page, there is no need to have we need to have a home component. We also need to remove Home item from the menu.

> Delete the home folder located at frontend->src->modules->home folder

> Delete the following entry from app-module.js
import home from '@/modules/home/home-module';

> Delete the home entry defined in const modules = {
const modules = {
  shared,

  settings,
  auth,
  iam,
  auditLog,
  layout,
  loan,
  book,
};

> Delete the menu entry on the side bar from file: frontend->src->iam->layout->components->menu.vue
      <el-menu-item :class="classFor('/', true)" :route="{ path: '/' }" index="/">
        <i class="el-icon-fa-home"></i>
        <span slot="title">
          <app-i18n code="home.menu"></app-i18n>
        </span>
      </el-menu-item>

> Remove all the text in the en.js file under home. The final entry should look like this:
  home: {
    menu: 'Home',
  },

*************************************************************************************************
*********************Next Customization: Book Listing Customization**
*************************************************************************************************

   * Create a book entries to see what we want to customize.

  - We want to make the book image to be at the start of the table (list).
  - We want to fix the way the book image icon looks like.

  - We don't want to show the following as part of the entry form and the table list:
    - id
    - Created at

  - We want isbn to be upper case ISBN

  - Edit the **frontend->src->modules->book->components->book-list-table.vue** 

> Let's remove the Created from showing in the table list. 

Locate and delete the following

      <el-table-column
        :label="fields.createdAt.label"
        :prop="fields.createdAt.name"
        sortable="custom"
      >
        <template slot-scope="scope">{{ presenter(scope.row, 'createdAt') }}</template>
      </el-table-column>

> Let's make the isbn upper case. This is done in the i18n en.js file.
Open the file.
Locate the fields entries (scroll down) for the Book label 
 book: {
      name: 'book',
      label: 'Books',
      menu: 'Books'
Locate the entry and change it to upper case:
      },
      fields: {
        id: 'Id',
        'isbn': 'ISBN',
        'title': 'Title',
        'author': 'Author',
        'numberOfCopiesRange': 'Nu
   
> Let's remove the id column from the table.
Locate and delete the table column entry
      <el-table-column :label="fields.id.label" :prop="fields.id.name" sortable="custom">
        <template slot-scope="scope">{{ presenter(scope.row, 'id') }}</template>
      </el-table-column>

> Let's move the book image to be the first column in the table (list).
Locate the table column entry for the image and move it to the top of the table above the isbn column  ** <el-table-column :label="fields.isbn.label" ***
      <el-table-column
        :label="fields.images.label"
        :prop="fields.images.name"
        align="center"
      >
        <template slot-scope="scope">
          <app-list-item-image :value="presenter(scope.row, 'images')"></app-list-item-image>
        </template>
      </el-table-column>

> We don't want to show the column label "image". Let's remove it.
Delete the column label   ** :label="fields.images.label"  ** 

> Let's fix the book icon (image)
- Add the following style class --  class="book-image-list-item"  -- to the <app-list-item-image template:
      <el-table-column
        :prop="fields.images.name"
        align="center"
      >
        <template slot-scope="scope">
          <app-list-item-image class="book-image-list-item" value="presenter(scope.row, 'images')"></app-list-item-image>
        </template>
      </el-table-column>

- Define the style 
<style>
.book-image-list-item {
  border-radius: 0;
  width: 50px;
  height: 50px;
  line-height: 50px
}
.book-image-list-item img {
  object-fit: cover
}
</style>

> Let's remove the id and created At from the form (called the book-list-filter.vue):
- Edit the **frontend->src->modules->book->components->book-list-filter.vue** 

Locate and delete the following entry to remove the id
      <el-col :lg="12" :md="16" :sm="24">
        <el-form-item :label="fields.id.label" :prop="fields.id.name">
          <el-input v-model="model[fields.id.name]"/>
        </el-form-item>
      </el-col>

Locate and delete the following to remove the created At
      <el-col style="margin-bottom: -0.41px;" :lg="12" :md="16" :sm="24">
        <el-form-item :label="fields.createdAtRange.label" :prop="fields.createdAtRange.name">
          <el-date-picker type="datetimerange" v-model="model[fields.createdAtRange.name]"></el-date-picker>
        </el-form-item>
      </el-col>

*************************************************************************************************
*********************Next Customization:  Loan Listing Customization**
*************************************************************************************************

- First Let's remove the Created At and Id from the Form and the list table

> Edit the frontend->src->modules->loan->components->loan-list-filter.vue

Delete both the id and CretedAt fields:

      <el-col :lg="12" :md="16" :sm="24">
        <el-form-item :label="fields.id.label" :prop="fields.id.name">
          <el-input v-model="model[fields.id.name]"/>
        </el-form-item>
      </el-col>

      <el-col style="margin-bottom: -0.41px;" :lg="12" :md="16" :sm="24">
        <el-form-item :label="fields.createdAtRange.label" :prop="fields.createdAtRange.name">
          <el-date-picker type="datetimerange" v-model="model[fields.createdAtRange.name]"></el-date-picker>
        </el-form-item>
      </el-col>

> Edit the frontend->src->modules->loan->components->loan-list-table.vue

Delete the id and createdAt fields

      <el-table-column :label="fields.id.label" :prop="fields.id.name" sortable="custom">
        <template slot-scope="scope">{{ presenter(scope.row, 'id') }}</template>
      </el-table-column>

      <el-table-column
        :label="fields.createdAt.label"
        :prop="fields.createdAt.name"
        sortable="custom"
      >
        <template slot-scope="scope">{{ presenter(scope.row, 'createdAt') }}</template>
      </el-table-column>

*************************************************************************************************
*********************Next Customization:  Settings Customization** ""Add loanPeriodInDays""
*************************************************************************************************

- Add loanPeriodInDays field to the database:

 >Let's add a field for Loan Period in Days to Settings. This field sets the number of allowable days the book can be checkeout (loaned) from the library. 

 For now, let's add the new field to the database. The customization section below, titled **Calculate the Due Date**, will make use of this field.

 **Let's start with the backend******   
 The Load Period in Days field does not exist in the database. We need to modify our model to add this field.

 We will use the Sequelize migrations to add a field to the model and subsequentl to the database table.

 > In mySQL Workbench, select and make your database as the default schema.
 > open a SQL command window.
 > Enter and run the following: ALTER TABLE settings ADD COLUMN loanPeriodDays integer;

 > Refresh your Workbench and examin the Settings table. The loanPeriodDays field was added to the table.

 > Next - Create a migration file under backend-sql->migrations->05052022-add-loan-period.sql
 P.S. You can change the prefix to reflect your date.

 > Paste the code and save: ALTER TABLE settings ADD COLUMN loanPeriodDays integer;

 Let's add the new field to our model:

 > navigate and edit the file: backend-sql->src->database->models->settings.js

 Add the following after the theme field

      loanPeriodInDays: {
        type: DataTypes.INTEGER
      },

******Next, Let's modify the frontend****** 
**Note:** The fields for each model in our application are declared in their own files.
These files:
Reside in the directory: frontend->src->modules-><tablename>
They have the format <tablename>-model.js

So the whole path is: frontend->src->modules-><tablename>-><tablename>-model.js

In our case, we are modifying the settings table. Let's edit it:

> Navigate to frontend->src->modules->settings->settings-module.js
> You must import the integer-field declaration first:
Insert the following at the top of the settings-module.js

import IntegerField from '@/shared/fields/integer-field';

> Next Locate and add the following to the const fields = {

const fields = {
  theme: new EnumeratorField(
    'theme',
    label('theme'),
    themes,
    { required: true },
  ),
  loanPeriodInDays: new IntegerField(
    'loanPeriodInDays',
    label('loanPeriodInDays'),
    { required: true, min: 1 },
  ),
};
*Note: min: 1 above implies loanPeriodInDays can be a min of 1 day or higher. You cannot save the settings if you indicate 0 days.

Save and close the file.

> Next we need to declare the label for this new field in the International en.js file
-Navigate to the frontend->src->i18n->en.js

- Locate the entity settings and add the label  -- loanPeriodInDays: 'Loan Period (In Days)' -- under fields below theme
  settings: {
    title: 'Settings',
    menu: 'Settings',
    save: {
      success:
        'Settings saved successfully. The page will reload in {0} seconds for changes to take effect.',
    },
    fields: {
      theme: 'Theme',
      loanPeriodInDays: 'Loan Period (In Days)'
    },

> Next, let's add / create a new form item in the Settings form.
The path to the forms is:

frontend->src->modules->components-><tablename>->

> Edit: frontend->src->modules->components->settings->settings-page.vue
> Add the new field item 
        <el-form-item
          :label="fields.loanPeriodInDays.label"
          :prop="fields.loadnPeriodInDays.name"
          :required="fields.loanPeriodInDays.required"
        >
        <el-input-number 
          :precision="0" 
          :step="1" 
          v-model="model[fields.loanPeriodInDays.name]" >

> Next (per Element-UI you can check the syntax on their website) let's add the inputnumber field inside the <el-form-item 
with a precision 0 since it is an integer 
and 
step=1 to increment by 1
and
bind it to a fields model

> Next, scroll down to scripts and add an entry in the FormSchema

const { fields } = SettingsModel;
const formSchema = new FormSchema([fields.theme, fields.loanPerPeriodInDays]);

*************************************************************************************************
*********************Next Customization: Members can only see their loans**
*************************************************************************************************
 ***Important note:**
 See Issue 2 stated at the beginning of this README file along with the suggested solution.***

- Let's check out a book: one for a member and the other one for the admin
> Click on Loan menu item -> New Loan
> Check out a book by completing the checkout form.

- The table lists the books that were checked out by both users. We want each logged in use to only see their list of books they checked out.

- we solve this using the backend-sql code:

> Navigate to **backend-sql->src->api->loan->loanList.js** 
The function  **findAndCountAll** which is in the loanService.js file is being called.

> Let's navigate to **backend-sql->src->services->loanService.js**

> Insert the following at the start of the file to define Roles 

    const Roles = require('../security/roles')

> Locate, Edit / modify the findAndCountAll:

  async findAndCountAll(args) {
    const isMember = this.currentUser.roles.includes(Roles.values.member) && !this.currentUser.roles.includes(Roles.values.librarian)
    if (isMember) {
      args.filter = {
        ...args.filter,
        member: this.currentUser.id
      }
    }
    return this.repository.findAndCountAll(args);
  }

**Next:** We want to display the field **member** on the Loans form only if the Admin is logged in. Otherwise, if a member is logged in, this field should not be showing.

> Edit the **frontend->src->modules->loan->components->loan-list-filter.vue**
> Add the v-if="!currentUserIsMember" condition 


      <el-col :lg="12" :md="16" :sm="24">
        <el-form-item 
          :label="fields.member.label" 
          :prop="fields.member.name"
          v-if="!currentUserIsMember"
        >
          <app-autocomplete-one-input
            :fetchFn="fields.member.fetchFn"
            v-model="model[fields.member.name]"
          ></app-autocomplete-one-input>
        </el-form-item>
      </el-col>

        >
**Next:
> Declare the currentUserIsMember by adding it to the computed section. 

> Scroll down to the computed section
> add currentUserIsMember: 'auth/currentUserIsMember'. 
  computed: {
    ...mapGetters({
      labelPosition: 'layout/labelPosition',
      labelWidthFilter: 'layout/labelWidthFilter',
      loading: 'loan/list/loading',
      filter: 'loan/list/filter',
      currentUserIsMember: 'auth/currentUserIsMember'
    }),

***Note:** - With the declaration above we are implying that currentUserIsMember method is declared in the auth/currentUserIsMember file.

- Let's add this method to the auth-store.js file:

> Navigate to the file: frontend->src->auth->auth-store.js

- First import the Roles by adding this statement to the file:

import Roles from '@/security/roles';

> Next, add the following to the file: 

    currrentUserIsMember: (state, getters) => {
      const roles = getters.roles
      return roles.includes(Roles.values.member) && !roles.includes(Roles.values.librarian)
    }

**Note:** getters.roles which returns the roles is already defined in the file (scroll up to find it)


*************************************************************************************************
*********************Next Customization: Improve the Book Label**
*************************************************************************************************
- When displaying the book, we want to display the title, author and ISBN
- We also want the list table to show all the same details as well in the Book column.

Let's start with the frontend:
> Edit the frontend->src->loan->loan-model.js
We notice that BookField has relationToOne
 BookField.relationToOne('book', label('book'), {
    "required": true

Let's open the frontend->src->modules->book->book-field.js

- The BookField is currently only returning only the title:

export class BookField {
  static relationToOne(name, label, options) {
:
:
:
        return {
          id: record.id,
          label: `${record.title}`
        };
      },
      options,
    );
  }

> update the class to return the rest of the fields:

        return {
          id: record.id,
          label: `${record.title} - ${record.author} - ${
            record.isbn
          }`,
        };
      },
      options,

**Note:** Test your changes. You will notice the changes above only impacted the list table (). That's because the book field information is fetch from the server using the 
BookService(
      req,
    ).findAllAutocomplete

where the file resides backend-sql->src->api->book->bookAutocomplete.js

- The bookAutocomplete is calling a method in the backend-sql->src->database->repositories->bookRepository.js 

Modify the findAll method to return the rest of the information ('id', 'isbn', 'title', 'author')

  async findAllAutocomplete(query, limit) {
    const filter = new SequelizeAutocompleteFilter(
      models.Sequelize,
    );

    if (query) {
      filter.appendId('id', query);
      // filter.appendIlike('isbn', query, 'book');
      filter.appendIlike('title', query, 'book');
    }

    const records = await models.book.findAll({
      attributes: ['id', 'isbn', 'title', 'author'],
      where: filter.getWhere(),
      limit: parseInt(limit) ? parseInt(limit) : undefined,
      // limit: limit || undefined,
      orderBy: [['isbn', 'ASC']],
    });
    // label: `${record.title} - ${record.author} - ${
    //   record.isbn
    return records.map((record) => ({
      id: record.id,
      //label: record.isbn,
      label: `${record.title} - ${record.author} - ${record.isbn}`
    }));
  }

**Note:** When you test it, you will see the book title, author and ISBN 
However, when you try to search by the Author for example, the search fails.
Reason being,
We are only currently fiterling on all fields (see filter.appendIlike above.)
Let's fix it by addinging additional filters so will be able to search by title, author or ISBN

    if (query) {
      filter.appendId('id', query);
      // filter.appendIlike('isbn', query, 'book');
      filter.appendIlike('title', query, 'book');
      filter.appendIlike('author', query, 'book');
      filter.appendIlike('isbn', query, 'book');
    }



*************************************************************************************************
*********************Next Customization: Calculate the Due Date**
*************************************************************************************************
 
 - We previously created a new field called loanPeriodInDays. This field sets the number of allowable days the book can be checkeout from the library. 
 The Due date is calculated based on the day the book was checked out + the number of days defined by the loanPeriodInDays.

 - Let's start on the backend.

When we create a loan, it calls the LoanService(req).create API call located in the 
backend-sql->src-api-loan->loanCreate.js

The create method is defined in the backend-sql->src->services->loanService.js
Which in turn, calls the method backend->sql->src->repositories->loanRepository.js
Using the parameters that was passed to it:
    this.inTableAttributes = [
      'id',
      'issueDate',
      'dueDate',
      'returnDate',
      'status',
      'importHash',
      'updatedAt',
      'createdAt',
    ];

- Let's create a method called calculateDueDate in the backend-sql->src->services->loanService.js 

> Add the following declaration:

const SettingsService = require('../services/settingsService')
const moment = require('moment')

> Next Add the method:

  async _calculateDueDate(data) {

    const settings = await SettingsService.findOrCreateDefault(this.currentUser)
    return moment(data.issueDate).add(settings.loanPeriodInDays, 'days').toISOString()
  }

Next, let's edit the async create(data)  method located at the beggining of the loanService.js 

> Scroll up to locate the async create(data) method
> Add the following:

data.dueDate = await this._calculateDueDate(data)

--- Now let's work on the frontend and edit the loan form to reflect the changes:

> Edit the frontend->src->modules->loan->components->loan-form-page.vue

We will use the same logic for loanPeriodInDays from the Settings form (previous customization) 

- Let's leverage the Vuex capabilities (Vuex.vuejs.org/guide) 

- Navigate to frontend->src->modules->settings->settings-store.js

Add the following loanPeriodsInDays: entry to the getters
  getters: {
    settings: (state) => state.settings,
    findLoading: (state) => !!state.findLoading,
    saveLoading: (state) => !!state.saveLoading,
    loanPeriodsInDays: (state) => (state.settings && state.settings.loanPeriodsInDays )
  },

- Next navigate to the load-form-page.vue
- Let's load the settings before the form is created. 
We will retrive the settings from the server:

a) let's map the doFindSettings method. 

Add the doFindSettings: 'settings/doFind'. 
The string implies the we will be calling the method doFind located in the setting-store.js

  methods: {
    ...mapActions({
      doFind: 'loan/form/doFind',
      doNew: 'loan/form/doNew',
      doUpdate: 'loan/form/doUpdate',
      doCreate: 'loan/form/doCreate',
      doFindSettings: 'settings/doFind',
    }),

-  Next, Add the loanPeriodInDays: 'settings/loanPeriodInDays' to Computted to map the Getters

computed: {
    ...mapGetters({
      labelPosition: 'layout/labelPosition',
      labelWidthForm: 'layout/labelWidthForm',
      record: 'loan/form/record',
      findLoading: 'loan/form/findLoading',
      saveLoading: 'loan/form/saveLoading',
      loanPeriodInDays: 'settings/loanPeriodInDays'
    }),

- We want the page to stay in loading state until the Settings are fully loaded.
Modify the spinner to add this variable

<div class="app-page-spinner" v-if="findLoading || findSettingsLoading" v-loading="findLoading"></div>

Let's defining it in computed. We will be calling the method findLoading which is in settings-store.js (again that's Vuex concept)

  computed: {
    ...mapGetters({
      labelPosition: 'layout/labelPosition',
      labelWidthForm: 'layout/labelWidthForm',
      record: 'loan/form/record',
      findLoading: 'loan/form/findLoading',
      saveLoading: 'loan/form/saveLoading',
      loanPeriodInDays: 'settings/loanPeriodInDays',
      findSettingsLoading: 'settings/findLoading'
    })

- Next modify the created method:

  async created() {
    await this.doFindSettings()
    if (this.isEditing) {
      await this.doFind(this.id);
    } else {
      await this.doNew();
    }

    this.model = formSchema.initialValues(this.record);
  },
  
- Next let's calculate the due date when the issue date is set:

When the issueDate value changes, it triggers an event. We will call the method/event onIssueDateChange

- Let's add this listener method to the issueDate:
<el-form-item
          :label="fields.issueDate.label"
          :prop="fields.issueDate.name"
          :required="fields.issueDate.required"
        >
          <el-col :lg="11" :md="16" :sm="24">
            <el-date-picker placeholder type="datetime" v-model="model[fields.issueDate.name]" @change="onIssueDateChange"></el-date-picker>
          </el-col>
        </el-form-item>

- Let's create the onIssueDateChange method. 
- First, let's import moment:
import moment from 'moment'

- Now, let create the method. We set the model value, which is declared in the data section as model: null, to the value of the calculated dueDate
    
    onIssueDateChange(value) {
      this.model.dueDate = moment(value).add(this.loanPeriodInDays, 'days')
    },


** Let's test our change:

1st - go into Settings an set the Loan Period In Days to 3 days.
2nd - go into Loan and create a new loan.
enter the Issue date. the due date should automatically populate with a due date that is 3 days later.

- Now, since the due date is calculate, let's disable the Due date field so the user does not modify it and make it readonly. 

**************************** It seems there is a bug since it does not work.************

*************************************************************************************************
*********************Next Customization: ***Loan Status** 
*************************************************************************************************

We would like to automatically set the Loan status. We would like to calculate the Status.

In Progress: Due date is in the future and the book is not returned
Overdue: If the book is not retuned and we passed the due date
Closed: If the book is returned.

Let's work on the backend system:

- Navigate to backendsql->src->database->models->loan.js

Sequelize allows us to create virtual fields.

> Change the status type from   type: DataTypes.ENUM to   type: DataTypes.VIRTUAL
      status: {
        type: DataTypes.VIRTUAL,
        values: [
          "inProgress",
          "overdue",
          "closed"
        ],
      },
> Next, instead of hard coding the statuses, we will call a function:
      status: {
        type: DataTypes.VIRTUAL,
        get: function() {
          if (this.get('returnDate')) {
            return 'closed';
          }

          if (
            moment().isAfter(moment(this.get('dueDate')))
          ) {
            return 'overdue';
          }

          return 'inProgress';
        },
      },

      importHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },

If we test it, the status is showing properly. We can change the dates and the status changes accordingly. However, if we click on the status field, we can still manually select the status.

- Next, let's prevent the user from selecting the status manually. 
We will modify the backend:

- the loanList method calls the findAndCountAll method.

- Let's first create a sequelizeFilter.appendCustom function to the sequelizeFilter.js

> Navigate to backend-sql->src->database->utils->sequelizeFilter.js
> Add the following funciton:

  appendCustom(condition) {
    this.whereAnd.push (condition)
  }

- Next, navigate to the backend-sql->src->database->repositories->loanRepository.js
- Scroll down to locate the filter.status. Let's modify this method:

From:
      if (filter.status) {
        sequelizeFilter.appendEqual('status', filter.status);
      }
To:

if (filter.status) {
        if (filter.status == 'closed') {
          sequelizeFilter.appendCustom({
            returnDate: {[models.Sequelize.Op.ne]: null}
          })
        }

        if (filter.status == 'overdue') {
          sequelizeFilter.appendEqual('returnDate', null)
          sequelizeFilter.appendCustom({
            dueDate: {
              [models.Sequelize.Op.lt]: new Date()
            }
          })
        }

        if (filter.status == 'inProgress') {
          sequelizeFilter.appendEqual('returnDate', null)
          sequelizeFilter.appendCustom({
            dueDate: {
              [models.Sequelize.Op.gte]: new Date()
            }
          })
        }

      }

- Next we will be using Tags from Element-UI for the Status.

> Add a component called load-status-tag.vue. We will leverage the element-ui tags.
> Enter the code accordingly. 

- Next, navigate to loan-list-table.vue
> Insert the following:
import LoanStatusTag from '@/modules/loan/components/loan-status-tag'

> Define the Component:
  components: {

    [LoanStatusTag.name]: LoanStatusTag
  },

  > Modify the table entry:
  From:
      <el-table-column
        :label="fields.status.label"
        :prop="fields.status.name"
        sortable="custom"
      >
        <template slot-scope="scope">{{ presenter(scope.row, 'status') }}</template>
      </el-table-column>

  To:

      <el-table-column
        :label="fields.status.label"
        :prop="fields.status.name"
        sortable="custom"
      >
        <template slot-scope="scope">
          <app-loan-status-tag :value="scope.row.status" />
        </template>
      </el-table-column>

    Note: The scope.row points to the current loan and we are extracting the status

    (Test your work)

    - Next, we need to implement the same changes on View Loan and Edit Loan

    > Navigate to loan-view-page.vue
    > Import and Define the component like we just previously do

    Modify the fields.status.label: We will use the app-view-item-custom to line up the status. You pass it the 2 parameters

    From:
      <app-view-item-text :label="fields.status.label" :value="presenter(record, 'status')"></app-view-item-text>
    
    To:

        <app-view-item-custom :label="fields.status.label" :value="record.status">
          <app-loan-status-tag :value="record.status" />
        </app-view-item-custom>

        (test it)

- Next, let fix the loan-form-page.vue
> navigate to loan-form-page.vue
> Import and Define the component

- There are several things we need to do here:

a) We need to reflect the status of the loan. We don't want to show the field unless it has a status. We do this by adding the v-if statement.
> Replace the following:

            <el-select placeholder v-model="model[fields.status.name]">
              <el-option :value="undefined">--</el-option>
              <el-option
                :key="option.id"
                :label="option.label"
                :value="option.id"
                v-for="option in fields.status.options"
              ></el-option>
            </el-select>

  With this:
        v-if="model.status"
          <el-col :lg="11" :md="16" :sm="24">
            <app-loan-status-tag :value="model.status" />
          </el-col>
        </el-form-item>

b) We want to reflect the status if we change the return date on the form. When editing the load, changing the return date should change its status.
Note: We previously made similar modifications to the issueDate.  (scroll up to locate the @change="onIssueDateChange and see how we implemented that logic).

Let's follow the same logic for the return date. 
One caviate, the loan status is also dependent on the Issue Date. Therefore, the logic for changing the status must account for both the Issue Date and returnDate.

> Add the @change="onReturnDateChange"

        <el-form-item
          :label="fields.returnDate.label"
          :prop="fields.returnDate.name"
          :required="fields.returnDate.required"
        >
          <el-col :lg="11" :md="16" :sm="24">
            <el-date-picker placeholder type="datetime" v-model="model[fields.returnDate.name]" @change="onReturnDateChange"></el-date-picker>
          </el-col>
        </el-form-item>

> We must Define the onReturnDateChange method and modify the onIssueDateChange method:

    onIssueDateChange(value) {
      this.model.dueDate = moment(value).add(
        this.loanPeriodInDays, 'days',
        )
        this.fillStatus(this.model.dueDate, this.model.returnDate) 
    },

    onReturnDateChange(value) {
      this.fillStatus(this.model.dueDate, value)
    },

    fillStatus(dueDate, returnDate) {
      if (returnDate) {
        this.model.status = 'closed'
        return
      }
      if (moment().isAfter(moment(dueDate))) {
        this.model.status = 'overdue'
        return
      }
      this.model.status = 'inProgress'
      return
    },


(test your changes)

*************************************************************************************************
*********************Next Customization: Different forms for creating and editing Loans**
*************************************************************************************************

This part of the customization will address the following:
I)
- When creating a new loan, the form should only show:
* Book
* Member
* Issue Date
* Save and Rest
The Due Date field and the Status are not visible.
However, once we enter the issue date, the Due Date field and the Status will become visible.

II)
- When we edit the Loan, 
* all the field are disabled with the exception of the Return Date.
* I cannot save the form unless I enter a return date.

Let's customize the forms:
1 - Editing the loan
a) Change the Return Date field to be required.
b) We will validate the entry on the server side.
c) When the form is save, we save only what changed, which, in our case is the Return Date.

> Navigate to the backend-sql->src->services->loanService.js
> locate the update method
If the user clicked the save button without filling the returnDate, throw a validation error
Enter the following:

if (!data.returnDate) {
  throw new ValidationError(this.language, 'entities.loan.validation.returnDateRequired')
}

> update/add to the backend-sql->src->i18n->en.js:

  entities: {
    loan: {
      validation: {
        returnDateRequired: 'Return Date is required'
      }
    }
  },

(test)

- Navigate to the backend-sql->src-database->repositories->loanRepository.js
- Locate the update method:
We want only the returnDate to be updated versus the whole record (all the fields)
The method below passes as a parameter this.inTableAttributes = [
      'id',
      'issueDate',
      'dueDate',
      'returnDate',
      'status',
      'importHash',
      'updatedAt',
      'createdAt',
    ];

    which has all the fields. We only want to update the returnDate. Let's modify the parameter

> a) Modify the following:
From:
      ...lodash.pick(data, this.inTableAttributes),

To:
      ...lodash.pick(data, ['returnDate']),

> b) Comment out or delete the following relations with the member and the book. We are only updating the returnDate and there is no need to update the downstream tables.

    await this._createOrUpdateRelations(
      record,
      data,
      options,
    );

> c) Comment out or delete the following:
    await this._createOrUpdateFiles(record, data, options);


    (test)

- Next, let's work on the frontend
- first let's make the returnDate a required field.

> Modify the frontend->src->modules->loan-model.js:
  returnDate: new DateTimeField('returnDate', label('returnDate'), {"required": true}),

- Next, the New Loan page should not show the returnDate field since when we are checking out the book, does not make sense to enter the returnDate.

- Let's edit the frontend->src->modules->components->loan-form-page.vue
We will have to add an additional formSchema.
The original one will be for creating a new record (loan) and the additional formSchema is when we Edit the record.

> Rename the existing formSchema to newformSchema and remove/delete the returnDate from it.
const newformSchema = new FormSchema([
  fields.id,
  fields.book,
  fields.member,
  fields.issueDate,
  fields.dueDate,

  fields.status,
]);

> add an additional formSchema with the name editformSchema
const editformSchema = new FormSchema([
  fields.id,
  fields.book,
  fields.member,
  fields.issueDate,
  fields.dueDate,
  fields.returnDate,
  fields.status,
]);

> Intialize both formSchemas in the data section. Associate each schema based on isEditing flag is true or false:

  data() {
    let rules = null;
    const isEditing = !!this.id
 
    if (isEditing) {
      rules = editformSchema.rules()
    }
    if (!isEditing) {
      rules = newformSchema.rules()
    }
    return {
      rules,
      model: null,
    };
  },

> add formSchema() to computed so it returns the one based on whether we are adding or editing the record.

> fix the reference issues (this.formSchema)

- Next, let's show the field returnDate on the form only when we are editing the record.
> Let's add the v-if="isEditing" statement

        <el-form-item
          :label="fields.returnDate.label"
          :prop="fields.returnDate.name"
          :required="fields.returnDate.required"
          v-if="isEditing"
        >
          <el-col :lg="11" :md="16" :sm="24">
            <el-date-picker placeholder type="datetime" v-model="model[fields.returnDate.name]" @change="onReturnDateChange"></el-date-picker>
          </el-col>
        </el-form-item>

- Next, we will do the same for the dueDate. The dueDate will show once we enter the issueDate.
Once entered, the dueDate is automatically calculated and the dueDate field has data in it. At this point, the vi-if statement is valid and the dueDate field will be visible.

> Let's add the  v-if="model.dueDate" statement

          <el-form-item
          :label="fields.dueDate.label"
          :prop="fields.dueDate.name"
          :required="fields.dueDate.required"
          v-if="model.dueDate"
        >
          <el-col :lg="11" :md="16" :sm="24">
            <el-date-picker placeholder type="datetime" v-model="model[fields.dueDate.name]"></el-date-picker>
          </el-col>
        </el-form-item> 

        (test it)

- So far we made the modifications on the backend, where we added the logic when editing the loan record, to prevent any data from being saved, except the returnDate.
The modifications we've done on the frontend so far manipulated the visibilitiy of the dueDate and returnDate based on the isEditing flag. However, we did not disable the rest of the fields to prevent the user from editing them. (even if they edit them, their changes won't be saved with the exception of the returnDate.)

- Let's disable the rest of the fields on the form:
add :disabled="isEditing" to the rest of the field.
Note: the disable funcitonalily on the element-ui date picker does not work.  

- The last part - If the book was previously returned, meaning the status is 'closed', there is no need to allow the user to edit/change the record.

- Let's disable/hide/remove the edit button/link from showing in the list table when the status is closed.

> navigate to load-form-list-table.vue and add another condition scope.row.status !== 'closed'

  v-if="hasPermissionToEdit  && scope.row.status !== 'closed'" >
