# 웹 페이지에서 노트북 셀을 실행할 때 쓰는 도우미 (주피터처럼 마지막 줄 값과 그래프를 보여 줌)
import ast, io, sys, base64, json, traceback, warnings

warnings.filterwarnings('ignore')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

G = {'__name__': '__main__'}


def _show(v):
    if v is None:
        return None, None
    mod = type(v).__module__ or ''
    if mod.startswith('matplotlib') or mod.startswith('seaborn'):
        return None, None
    if mod.startswith('pandas') and hasattr(v, 'to_html'):
        try:
            if hasattr(v, 'columns'):
                return v.to_html(max_rows=12, max_cols=14, border=0, float_format=lambda x: f'{x:.4g}'), None
        except Exception:
            pass
    return None, repr(v)


def run_cell(code):
    out = io.StringIO()
    old_out, old_err = sys.stdout, sys.stderr
    sys.stdout = sys.stderr = out
    html = text = None
    err = False
    try:
        tree = ast.parse(code)
        last = None
        if tree.body and isinstance(tree.body[-1], ast.Expr):
            last = ast.Expression(tree.body.pop().value)
        exec(compile(tree, '<셀>', 'exec'), G)
        if last is not None:
            html, text = _show(eval(compile(last, '<셀>', 'eval'), G))
    except Exception:
        err = True
        et, ev, tb = sys.exc_info()
        print(''.join(traceback.format_exception_only(et, ev)).strip())
    finally:
        sys.stdout, sys.stderr = old_out, old_err
    imgs = []
    for n in plt.get_fignums():
        buf = io.BytesIO()
        plt.figure(n).savefig(buf, format='png', dpi=72, bbox_inches='tight')
        imgs.append(base64.b64encode(buf.getvalue()).decode())
    plt.close('all')
    return json.dumps({'stdout': out.getvalue(), 'html': html, 'text': text, 'imgs': imgs, 'err': err}, ensure_ascii=False)
