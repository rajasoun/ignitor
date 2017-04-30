# ToDo

[ ] Docker Dynamic Inventory Not Working
[ ] Replacing make Files with docker-compose
[ ] Folder Refactor resulting in docker-compose Changes. Fix It 

# Encrypt/Decrypt Certificates

ansible-vault encrypt application/web-proxy/nginx-proxy/rootfs/etc/nginx/certs/tracker.learn.cisco-selfsign.* --vault-password-file ./.vault_pass
ansible-vault decrypt application/web-proxy/nginx-proxy/rootfs/etc/nginx/certs/tracker.learn.cisco-selfsign.* --vault-password-file ./.vault_pass

