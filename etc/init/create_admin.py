import sys
import yaml

with open('./etc/init/default-admin.yaml') as f:
	attrs = yaml.load(f)

sys.path.insert(0, '.')
import api

from api.domain.users import User
from api.db import Session

admin = User(**attrs)
admin.type = 'admin'

sess = Session()
sess.add(admin)
sess.commit()
sess.close()
