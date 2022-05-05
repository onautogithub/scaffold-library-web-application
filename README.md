Version 1.2.1.
https://scaffoldhub.io

This code can only be used for academic and learning purposes.

We must use **node 8** for this project

**It is recommended that you use a Node Version Manager tool for you to be able to switch version** if you need it in the future.
The tool is called **nvm** and can be found here: https://github.com/coreybutler/nvm-windows

We must install cross-env before you start on the server side. Since we are using node verison 8, we must install this specific
version of cross-env (see notes here: https://www.npmjs.com/package/cross-env)
npm install --save-dev cross-env@6

*** Issue with Sequelize passing the limit and offset parameters as strings ***
** You will get error 500 when you try to get list of users, loans, books, etc

To resolve the issue, replace the following entries in the various files (e.g:
bookRepository.js, auditLogRepository.js, userRepository.js, loanRepository.js)
     limit: limit || undefined, to limit: parseInt(limit) ? parseInt(limit) : undefined,
     offset: offset || undefined, to  offset: parseInt(offset) ? parseInt(offset) : undefined,

*** Upgrade Sequelize and mySqlpassing the limit and offset parameters as strings ***
Due to the issues with Sequelize above passing the limit and offset parameters as strings,
I upgraded Sequellize and mysql2 to the latest version. 
From: "sequelize": "4.42.1" to sequelize": "^6.19.0"
From: "mysql2": "1.6.5" to mysql2": "2.3.3"
from "element-ui": "2.5.4" to "element-ui": "2.15.8"

The upgrade did not resolve the issue. However, it caused other issues. 
Perform the following steps resolve these new issues:

a) Import issue in the index file src->database->models->index.js at line 25.

Action to take: Comment out the statement and replace it with the uncommented one.
  .forEach(function(file) {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
    // const model = sequelize['import'](
    //   path.join(__dirname, file),
    // );
    db[model.name] = model;
  });

  b) operatorsAliases is Sequelize version 5 and above is not longer required.
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

*** Now with the rest of the tutorial --- Customization**

**Important Note:** The first user you create when you login to the application has all the admin priveleages. 
This is defined as **isFirstUser** in the **backend\srs\services\auth\authService.js** file.

The following are the steps from the video to customize the library project:

*** Modify the localhost config file ***
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

*** Modify i18n: en.js ***

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

*** Replace the signin and sign up side image** 
Under the public directory (frontend->public), replace the signin.jpg and singup.jpg with your images using the same names.

*** Next add Icons to the menu. User font-awesome 4.7.9**
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

**Next re-arrange the side menu**
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

  ***Next Modify the Librarian and Member roles***
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


**Next Customization: Home Page Redirection**

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

  **Next Book Listing Customization**

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


 **Next Loan Listing Customization**

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

 **Next Settings Customization**

 >Let's add a field for Loan Period in Days to Settings

 *********************Let's start with the backend******   
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

      loadPeriodInDays: {
        type: DataTypes.INTEGER
      },

*********************Let's modify the frontend****** 
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
  loadPeriodInDays: new IntegerField(
    'loadPeriodInDays',
    label('loadPeriodInDays'),
    { required: true, min: 1 },
  ),
};
*Note: min: 1 above implies loadPeriodInDays can be a min of 1 day or higher. You cannot save the settings if you indicate 0 days.

Save and close the file.

> Next we need to declare the label for this new field in the International en.js file
-Navigate to the frontend->src->i18n->en.js

- Locate the entity settings and add the label  -- loadPeriodInDays: 'Loan Period (In Days)' -- under fields below theme
  settings: {
    title: 'Settings',
    menu: 'Settings',
    save: {
      success:
        'Settings saved successfully. The page will reload in {0} seconds for changes to take effect.',
    },
    fields: {
      theme: 'Theme',
      loadPeriodInDays: 'Loan Period (In Days)'
    },

> Next, let's add / create a new form item in the Settings form.
The path to the forms is:

frontend->src->modules->components-><tablename>->

> Edit: frontend->src->modules->components->settings->settings-page.vue
> Add the new field item 
        <el-form-item
          :label="fields.loadPeriodInDays.label"
          :prop="fields.loadnPeriodInDays.name"
          :required="fields.loadPeriodInDays.required"
        >
        <el-input-number 
          :precision="0" 
          :step="1" 
          v-model="model[fields.loadPeriodInDays.name]" >

> Next (per Element-UI you can check the syntax on their website) let's add the inputnumber field inside the <el-form-item 
with a precision 0 since it is an integer 
and 
step=1 to increment by 1
and
bind it to a fields model

> Next, scroll down to scripts and add an entry in the FormSchema

const { fields } = SettingsModel;
const formSchema = new FormSchema([fields.theme, fields.loanPerPeriodInDays]);


 **Next Members can only see their loans**

 
