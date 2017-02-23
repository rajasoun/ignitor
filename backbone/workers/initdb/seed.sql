GRANT ALL ON *.* TO 'ckuser'@'%' ;FLUSH PRIVILEGES;
GRANT ALL ON *.* TO 'ckuser'@'localhost' ;FLUSH PRIVILEGES;
GRANT ALL ON b2b.* TO 'ckuser'@'%' ;FLUSH PRIVILEGES;
GRANT ALL ON b2b.* TO 'ckuser'@'localhost' ;FLUSH PRIVILEGES;


  create table subject(_id varchar(100), name varchar(200), tenant_id varchar(100),
    app_id varchar(20), type varchar(20), status varchar(10), created_by_id varchar(100),
    created_by_app_id varchar(100),created_by_tenant_id varchar(100),
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_changed_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (_id, tenant_id, app_id, type),
    CONSTRAINT to_subject FOREIGN KEY (created_by_id, created_by_tenant_id, created_by_app_id)
     REFERENCES subject(_id, tenant_id, app_id) ON DELETE CASCADE
);

create table subject_to_subject (
    from_subject_id varchar(100),
    from_subject_tenant_id varchar(100),
    from_subject_app_id varchar(20),
    to_subject_id varchar(100),
    to_subject_tenant_id varchar(100),
    to_subject_app_id varchar(20),
    UNIQUE KEY (from_subject_id, from_subject_tenant_id, from_subject_app_id, to_subject_id, to_subject_tenant_id, to_subject_app_id),
    CONSTRAINT fk_to_subject FOREIGN KEY (to_subject_id, to_subject_tenant_id, to_subject_app_id)
    REFERENCES subject(_id, tenant_id, app_id) ON DELETE CASCADE,
    CONSTRAINT fk_from_subject FOREIGN KEY (from_subject_id, from_subject_tenant_id, from_subject_app_id)
    REFERENCES subject(_id, tenant_id, app_id) ON DELETE CASCADE
    );


create table resource (_id varchar(100), name varchar(200), description varchar(200), tenant_id varchar(100),
app_id varchar(20), type varchar(20),
created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (_id, tenant_id, app_id));

create table resource_permission (
    subject_id varchar(100), subject_tenant_id varchar(100),
    subject_app_id varchar(20),
    resource_id varchar(200), resource_tenant_id varchar(100),
    resource_app_id varchar(20), permission_type varchar(20),
    UNIQUE KEY (subject_id, subject_tenant_id, subject_app_id, resource_id, resource_tenant_id, resource_app_id, permission_type),
    CONSTRAINT fk_resource_permission FOREIGN KEY (subject_id, subject_tenant_id, subject_app_id)
    REFERENCES subject(_id, tenant_id, app_id) ON DELETE CASCADE,
    CONSTRAINT fk_resource_p FOREIGN KEY (resource_id, resource_tenant_id, resource_app_id)
    REFERENCES resource(_id, tenant_id, app_id) ON DELETE CASCADE
);
